/**
 * Add/Edit Product Modal Component
 * Modern minimal design with all features
 * @module admin/products/AddProduct
 */

'use client';

import React, { useState } from 'react';
import { ProductModalProps } from './types';
import { useProductForm } from './hooks/useProductForm';
import { ImageUpload } from './components/ImageUpload';
import { BasicInfoForm } from './components/BasicInfoForm';
import { AttributeSelector } from './components/AttributeSelector';
import { VariantList } from './components/VariantList';
import { SizeColorSelector } from './components/SizeColorSelector';

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  categories,
  attributes,
  sizes,
  colors,
  onClose,
  onSave,
  mode,
}) => {
  const {
    currentStep,
    formData,
    images,
    selectedAttributes,
    variants,
    selectedSizes,
    selectedColors,
    saving,
    uploadingImages,
    generatingVariants,
    setCurrentStep,
    setFormData,
    setImages,
    setSelectedAttributes,
    setVariants,
    setSelectedSizes,
    setSelectedColors,
    handleNameChange,
    handleSubmit,
    generateVariantCombinations,
  } = useProductForm({ product, mode, attributes, onSave });

  const [activeTab, setActiveTab] = useState<'details' | 'images' | 'variants'>('details');

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'create' ? 'Create Product' : 'Edit Product'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {currentStep === 'basic' ? 'Fill in product information' : 'Configure variants'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {currentStep === 'basic' ? (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'details'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('images')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'images'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Images
                </button>
                {!formData.has_variants && (
                  <button
                    onClick={() => setActiveTab('variants')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'variants'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Sizes & Colors
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6">
                {activeTab === 'details' && (
                  <BasicInfoForm
                    formData={formData}
                    categories={categories}
                    onFormDataChange={setFormData}
                    onNameChange={handleNameChange}
                    mode={mode}
                  />
                )}

                {activeTab === 'images' && (
                  <ImageUpload images={images} onImagesChange={setImages} />
                )}

                {activeTab === 'variants' && !formData.has_variants && (
                  <SizeColorSelector
                    sizes={sizes}
                    colors={colors}
                    selectedSizes={selectedSizes}
                    selectedColors={selectedColors}
                    onSizesChange={setSelectedSizes}
                    onColorsChange={setSelectedColors}
                  />
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImages}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {saving || uploadingImages ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {uploadingImages ? 'Uploading...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      {formData.has_variants && mode === 'create'
                        ? 'Continue to Variants'
                        : mode === 'create'
                        ? 'Create Product'
                        : 'Update Product'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Attribute Selection */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Configure Variants</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Select attributes to generate variant combinations
                  </p>
                </div>

                <AttributeSelector
                  attributes={attributes}
                  selectedAttributes={selectedAttributes}
                  onSelectionChange={setSelectedAttributes}
                />

                <button
                  type="button"
                  onClick={generateVariantCombinations}
                  disabled={selectedAttributes.length === 0 || generatingVariants}
                  className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {generatingVariants ? 'Generating...' : 'Generate Variants'}
                </button>
              </div>

              {/* Variants List */}
              <VariantList
                variants={variants}
                attributes={attributes}
                onVariantUpdate={updateVariant}
                onVariantRemove={removeVariant}
                onClearAll={() => setVariants([])}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep('basic')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={variants.length === 0 || saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  `Create ${variants.length} Variants`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
