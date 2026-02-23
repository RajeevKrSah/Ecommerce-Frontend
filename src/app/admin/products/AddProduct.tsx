/**
 * Add/Edit Product Modal Component
 * Production-ready modular implementation
 * @module admin/products/AddProduct
 */

'use client';

import React from 'react';
import { ProductModalProps } from './types';
import { useProductForm } from './hooks/useProductForm';
import { ImageUpload } from './components/ImageUpload';
import { BasicInfoForm } from './components/BasicInfoForm';
import { AttributeSelector } from './components/AttributeSelector';
import { VariantList } from './components/VariantList';

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  categories,
  attributes,
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
    saving,
    uploadingImages,
    generatingVariants,
    setCurrentStep,
    setFormData,
    setImages,
    setSelectedAttributes,
    setVariants,
    handleNameChange,
    handleSubmit,
    generateVariantCombinations,
  } = useProductForm({ product, mode, attributes, onSave });

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-4 max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Create New Product' : 'Edit Product'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {currentStep === 'basic'
                ? 'Add product details and images'
                : 'Configure product variants'}
            </p>
          </div>
          {currentStep === 'variants' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">Step 2 of 2</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {currentStep === 'basic' ? (
            <form onSubmit={handleSubmit} className="space-y-8 text-gray-500">
              <ImageUpload images={images} onImagesChange={setImages} />

              <BasicInfoForm
                formData={formData}
                categories={categories}
                onFormDataChange={setFormData}
                onNameChange={handleNameChange}
                mode={mode}
              />

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImages}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  {saving || uploadingImages ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {uploadingImages
                        ? 'Uploading Images...'
                        : saving
                        ? 'Saving...'
                        : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
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
          ) : (
            <div className="space-y-6">
              {/* Attribute Selection */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Configure Product Variants
                  </h3>
                  <p className="text-sm text-gray-600">
                    Select attributes and their values to generate variant combinations
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
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {generatingVariants ? 'Generating...' : 'Generate Variant Combinations'}
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

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep('basic')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={variants.length === 0 || saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Variants...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
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
                      Create {variants.length} Variants
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
