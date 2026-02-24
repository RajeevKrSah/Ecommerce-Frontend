/**
 * Size and Color Selector Component
 * Allows selecting available sizes and colors for a product
 * @module admin/products/components/SizeColorSelector
 */

import React from 'react';

interface Size {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}

interface Color {
  id: number;
  name: string;
  code: string;
  hex_code: string;
  is_active: boolean;
}

interface SizeColorSelectorProps {
  sizes: Size[];
  colors: Color[];
  selectedSizes: number[];
  selectedColors: number[];
  onSizesChange: (sizeIds: number[]) => void;
  onColorsChange: (colorIds: number[]) => void;
}

export const SizeColorSelector: React.FC<SizeColorSelectorProps> = ({
  sizes,
  colors,
  selectedSizes,
  selectedColors,
  onSizesChange,
  onColorsChange,
}) => {
  const toggleSize = (sizeId: number) => {
    if (selectedSizes.includes(sizeId)) {
      onSizesChange(selectedSizes.filter(id => id !== sizeId));
    } else {
      onSizesChange([...selectedSizes, sizeId]);
    }
  };

  const toggleColor = (colorId: number) => {
    if (selectedColors.includes(colorId)) {
      onColorsChange(selectedColors.filter(id => id !== colorId));
    } else {
      onColorsChange([...selectedColors, colorId]);
    }
  };

  const selectAllSizes = () => {
    const activeSizeIds = sizes.filter(s => s.is_active).map(s => s.id);
    onSizesChange(activeSizeIds);
  };

  const clearAllSizes = () => {
    onSizesChange([]);
  };

  const selectAllColors = () => {
    const activeColorIds = colors.filter(c => c.is_active).map(c => c.id);
    onColorsChange(activeColorIds);
  };

  const clearAllColors = () => {
    onColorsChange([]);
  };

  return (
    <div className="space-y-6">
      {/* Sizes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Available Sizes</h3>
            <p className="text-sm text-gray-500 mt-1">
              Select sizes available for this product
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAllSizes}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={clearAllSizes}
              className="text-sm text-gray-600 hover:text-gray-700 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>

        {sizes.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <p className="text-gray-600 font-medium">No sizes available</p>
            <p className="text-sm text-gray-500 mt-1">
              Create sizes in the Size Management section first
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {sizes.map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => toggleSize(size.id)}
                disabled={!size.is_active}
                className={`
                  relative px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all
                  ${
                    selectedSizes.includes(size.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : size.is_active
                      ? 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {size.name}
                {selectedSizes.includes(size.id) && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {selectedSizes.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>
              {selectedSizes.length} size{selectedSizes.length !== 1 ? 's' : ''} selected
            </span>
          </div>
        )}
      </div>

      {/* Colors Section */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Available Colors</h3>
            <p className="text-sm text-gray-500 mt-1">
              Select colors available for this product
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAllColors}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={clearAllColors}
              className="text-sm text-gray-600 hover:text-gray-700 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>

        {colors.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
            <p className="text-gray-600 font-medium">No colors available</p>
            <p className="text-sm text-gray-500 mt-1">
              Create colors in the Color Management section first
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => toggleColor(color.id)}
                disabled={!color.is_active}
                className={`
                  relative flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all
                  ${
                    selectedColors.includes(color.id)
                      ? 'border-blue-500 bg-blue-50'
                      : color.is_active
                      ? 'border-gray-300 bg-white hover:border-gray-400'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                  }
                `}
              >
                <div
                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                  style={{ backgroundColor: color.hex_code }}
                />
                <span className="text-xs font-medium text-gray-700 text-center">
                  {color.name}
                </span>
                {selectedColors.includes(color.id) && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {selectedColors.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>
              {selectedColors.length} color{selectedColors.length !== 1 ? 's' : ''} selected
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
