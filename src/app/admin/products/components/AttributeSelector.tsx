/**
 * Attribute Selector Component
 * Displays available attributes with visual indicators
 * @module admin/products/components/AttributeSelector
 */

import React from 'react';
import { Attribute } from '@/types/variant';

interface AttributeSelectorProps {
  attributes: Attribute[];
  selectedAttributes: number[];
  onSelectionChange: (selected: number[]) => void;
}

export const AttributeSelector: React.FC<AttributeSelectorProps> = ({
  attributes,
  selectedAttributes,
  onSelectionChange,
}) => {
  const toggleAttribute = (attrId: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedAttributes, attrId]);
    } else {
      onSelectionChange(selectedAttributes.filter((id) => id !== attrId));
    }
  };

  if (attributes.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">No Attributes Available</h4>
            <p className="text-sm text-yellow-800">
              Please run the database seeder to create attributes (Color, Size, Material).
            </p>
            <code className="block mt-2 text-xs bg-yellow-100 px-2 py-1 rounded">
              php artisan db:seed --class=AttributeSeeder
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {attributes.map((attr) => {
        const isSelected = selectedAttributes.includes(attr.id);
        return (
          <div
            key={attr.id}
            className={`border-2 rounded-xl p-4 transition-all ${
              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => toggleAttribute(attr.id, e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="text-base font-semibold text-gray-900">{attr.name}</div>
                <div className="text-sm text-gray-500">{attr.values.length} options available</div>
              </div>
              {isSelected && (
                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                  Selected
                </span>
              )}
            </label>

            {/* Show attribute values */}
            <div className="ml-8 flex flex-wrap gap-2">
              {attr.values.map((value) => {
                const meta =
                  value.meta && typeof value.meta === 'string'
                    ? JSON.parse(value.meta)
                    : value.meta;
                const hexColor = meta?.hex;

                return (
                  <div
                    key={value.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${
                      isSelected ? 'bg-white border-blue-300' : 'bg-gray-50 border-gray-200'
                    }`}
                    title={value.value}
                  >
                    {hexColor && (
                      <div
                        className="w-4 h-4 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: hexColor }}
                      />
                    )}
                    <span className="font-medium text-gray-700">{value.value}</span>
                    <span className="text-xs text-gray-500">({value.code})</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
};
