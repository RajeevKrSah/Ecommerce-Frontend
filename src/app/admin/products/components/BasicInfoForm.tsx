/**
 * Basic Product Information Form
 * @module admin/products/components/BasicInfoForm
 */

import React from 'react';
import { ProductFormData, Category } from '../types';

interface BasicInfoFormProps {
  formData: ProductFormData;
  categories: Category[];
  onFormDataChange: (data: ProductFormData) => void;
  onNameChange: (name: string) => void;
  mode: 'create' | 'edit';
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  formData,
  categories,
  onFormDataChange,
  onNameChange,
  mode,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Product Name */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., Premium Cotton T-Shirt"
            required
          />
        </div>

        {/* SKU and Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SKU <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => onFormDataChange({ ...formData, sku: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., TSH-001"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => onFormDataChange({ ...formData, category_id: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price and Sale Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Regular Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => onFormDataChange({ ...formData, price: e.target.value })}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              value={formData.sale_price}
              onChange={(e) => onFormDataChange({ ...formData, sale_price: e.target.value })}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Stock Quantity */}
        {!formData.has_variants && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.stock_quantity}
              onChange={(e) =>
                onFormDataChange({ ...formData, stock_quantity: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
              required={!formData.has_variants}
            />
          </div>
        )}

        {/* Short Description */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description
          </label>
          <input
            type="text"
            value={formData.short_description}
            onChange={(e) =>
              onFormDataChange({ ...formData, short_description: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Brief product description for listings"
          />
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            rows={4}
            placeholder="Detailed product description, features, materials, etc."
          />
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => onFormDataChange({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-900">Active</div>
              <div className="text-xs text-gray-500">Product visible in store</div>
            </div>
          </label>

          <label className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => onFormDataChange({ ...formData, is_featured: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-900">Featured</div>
              <div className="text-xs text-gray-500">Show on homepage</div>
            </div>
          </label>

          {mode === 'create' && (
            <label className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formData.has_variants}
                onChange={(e) =>
                  onFormDataChange({ ...formData, has_variants: e.target.checked })
                }
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Has Variants</div>
                <div className="text-xs text-gray-500">Multiple sizes/colors</div>
              </div>
            </label>
          )}
        </div>
      </div>
    </div>
  );
};
