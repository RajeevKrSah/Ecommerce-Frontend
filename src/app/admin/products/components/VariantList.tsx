/**
 * Variant List Component
 * Displays and manages generated product variants
 * @module admin/products/components/VariantList
 */

import React from 'react';
import { VariantFormData } from '../types';
import { Attribute } from '@/types/variant';

interface VariantListProps {
  variants: VariantFormData[];
  attributes: Attribute[];
  onVariantUpdate: (index: number, field: keyof VariantFormData, value: any) => void;
  onVariantRemove: (index: number) => void;
  onClearAll: () => void;
}

export const VariantList: React.FC<VariantListProps> = ({
  variants,
  attributes,
  onVariantUpdate,
  onVariantRemove,
  onClearAll,
}) => {
  const getVariantDetails = (attributeValues: number[]) => {
    return attributeValues
      .map((valueId) => {
        for (const attr of attributes) {
          const value = attr.values.find((v) => v.id === valueId);
          if (value) {
            const meta =
              value.meta && typeof value.meta === 'string'
                ? JSON.parse(value.meta)
                : value.meta;
            return {
              attrName: attr.name,
              valueName: value.value,
              valueCode: value.code,
              hexColor: meta?.hex,
            };
          }
        }
        return null;
      })
      .filter(Boolean);
  };

  if (variants.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Generated Variants ({variants.length})
          </h3>
          <p className="text-sm text-gray-600">
            Review and adjust pricing and stock for each variant
          </p>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
        {variants.map((variant, index) => {
          const variantDetails = getVariantDetails(variant.attribute_values);

          return (
            <div
              key={index}
              className="p-4 border-2 border-gray-200 rounded-xl bg-white hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {variantDetails.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {detail?.hexColor && (
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                          style={{ backgroundColor: detail.hexColor }}
                          title={detail.valueName}
                        />
                      )}
                      <div>
                        <div className="text-xs text-gray-500">{detail?.attrName}</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {detail?.valueName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => onVariantRemove(index)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove variant"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">SKU</label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => onVariantUpdate(index, 'sku', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., TSH-001-BLK-M"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={variant.price}
                    onChange={(e) => onVariantUpdate(index, 'price', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={variant.stock_quantity}
                    onChange={(e) => onVariantUpdate(index, 'stock_quantity', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
