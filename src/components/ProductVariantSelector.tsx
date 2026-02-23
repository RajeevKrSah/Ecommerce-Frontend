'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ProductWithVariants,
  ProductVariant,
  Attribute,
  VariantSelection,
} from '@/types/variant';
import { variantService } from '@/services/variant.service';

interface ProductVariantSelectorProps {
  product: ProductWithVariants;
  onVariantChange?: (variant: ProductVariant | null) => void;
  onAddToCart?: (variant: ProductVariant) => void;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  product,
  onVariantChange,
  onAddToCart,
}) => {
  const [selectedAttributes, setSelectedAttributes] = useState<VariantSelection>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(false);

  // Find matching variant based on selected attributes
  const findMatchingVariant = useMemo(() => {
    if (!product.available_variants || product.available_variants.length === 0) {
      return null;
    }

    // Check if all required attributes are selected
    const requiredAttributes = product.attributes?.filter((attr) => attr.is_required) || [];
    const allRequiredSelected = requiredAttributes.every(
      (attr) => selectedAttributes[attr.code]
    );

    if (!allRequiredSelected) {
      return null;
    }

    // Find variant that matches all selected attributes
    return product.available_variants.find((variant) => {
      if (!variant.formatted_attributes) return false;

      return Object.entries(selectedAttributes).every(([attrCode, valueCode]) => {
        const variantAttr = variant.formatted_attributes?.find(
          (attr) => attr.code === attrCode
        );
        return variantAttr?.value_code === valueCode;
      });
    });
  }, [product, selectedAttributes]);

  // Update selected variant when selection changes
  useEffect(() => {
    const variant = findMatchingVariant;
    setSelectedVariant(variant || null);
    onVariantChange?.(variant || null);
  }, [findMatchingVariant, onVariantChange]);

  // Handle attribute selection
  const handleAttributeChange = (attributeCode: string, valueCode: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeCode]: valueCode,
    }));
  };

  // Check if a specific attribute value is available
  const isAttributeValueAvailable = (
    attribute: Attribute,
    valueCode: string
  ): boolean => {
    if (!product.available_variants) return false;

    // Create temporary selection with this value
    const tempSelection = { ...selectedAttributes, [attribute.code]: valueCode };

    // Check if any variant matches this selection
    return product.available_variants.some((variant) => {
      if (!variant.formatted_attributes) return false;

      return Object.entries(tempSelection).every(([attrCode, vCode]) => {
        const variantAttr = variant.formatted_attributes?.find(
          (attr) => attr.code === attrCode
        );
        return variantAttr?.value_code === vCode;
      });
    });
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    setLoading(true);
    try {
      await onAddToCart?.(selectedVariant);
    } finally {
      setLoading(false);
    }
  };

  // Get stock status
  const stockStatus = selectedVariant
    ? variantService.getStockStatus(selectedVariant)
    : null;

  if (!product.has_variants) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Attribute Selectors */}
      {product.attributes?.map((attribute) => (
        <div key={attribute.code} className="space-y-3">
          <label className="block text-sm font-medium text-gray-900">
            {attribute.name}
            {attribute.is_required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {attribute.type === 'color' ? (
            <ColorSelector
              attribute={attribute}
              selected={selectedAttributes[attribute.code]}
              onChange={(value) => handleAttributeChange(attribute.code, value)}
              isAvailable={(value) => isAttributeValueAvailable(attribute, value)}
            />
          ) : (
            <SelectSelector
              attribute={attribute}
              selected={selectedAttributes[attribute.code]}
              onChange={(value) => handleAttributeChange(attribute.code, value)}
              isAvailable={(value) => isAttributeValueAvailable(attribute, value)}
            />
          )}
        </div>
      ))}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="border-t pt-6 space-y-4">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {variantService.formatPrice(selectedVariant.price)}
            </span>
            {selectedVariant.original_price &&
              selectedVariant.original_price !== selectedVariant.price && (
                <span className="text-lg text-gray-500 line-through">
                  {variantService.formatPrice(selectedVariant.original_price)}
                </span>
              )}
          </div>

          {/* Stock Status */}
          {stockStatus && (
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                stockStatus.status === 'in_stock'
                  ? 'bg-green-100 text-green-800'
                  : stockStatus.status === 'low_stock'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {stockStatus.message}
            </div>
          )}

          {/* SKU */}
          <p className="text-sm text-gray-500">SKU: {selectedVariant.sku}</p>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant.is_available || loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      )}

      {/* Selection Required Message */}
      {!selectedVariant && product.attributes && product.attributes.length > 0 && (
        <div className="text-sm text-gray-500 italic">
          Please select all options to continue
        </div>
      )}
    </div>
  );
};

// Color Selector Component
const ColorSelector: React.FC<{
  attribute: Attribute;
  selected?: string;
  onChange: (value: string) => void;
  isAvailable: (value: string) => boolean;
}> = ({ attribute, selected, onChange, isAvailable }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {attribute.values.map((value) => {
        const available = isAvailable(value.code);
        const isSelected = selected === value.code;
        const hexColor = value.meta?.hex || '#CCCCCC';

        return (
          <button
            key={value.code}
            onClick={() => available && onChange(value.code)}
            disabled={!available}
            className={`relative w-10 h-10 rounded-full border-2 transition-all ${
              isSelected
                ? 'border-blue-600 ring-2 ring-blue-200'
                : 'border-gray-300 hover:border-gray-400'
            } ${!available ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
            title={value.value}
            style={{ backgroundColor: hexColor }}
          >
            {!available && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-gray-400 rotate-45" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

// Select Selector Component
const SelectSelector: React.FC<{
  attribute: Attribute;
  selected?: string;
  onChange: (value: string) => void;
  isAvailable: (value: string) => boolean;
}> = ({ attribute, selected, onChange, isAvailable }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {attribute.values.map((value) => {
        const available = isAvailable(value.code);
        const isSelected = selected === value.code;

        return (
          <button
            key={value.code}
            onClick={() => available && onChange(value.code)}
            disabled={!available}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
              isSelected
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            } ${
              !available
                ? 'opacity-30 cursor-not-allowed line-through'
                : 'cursor-pointer'
            }`}
          >
            {value.value}
          </button>
        );
      })}
    </div>
  );
};

export default ProductVariantSelector;
