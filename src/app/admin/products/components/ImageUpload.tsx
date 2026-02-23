/**
 * Image Upload Component
 * Handles product image upload with preview and primary selection
 * @module admin/products/components/ImageUpload
 */

import React from 'react';
import { ProductImage } from '../types';

interface ImageUploadProps {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ images, onImagesChange }) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      is_primary: images.length === 0 && index === 0,
    }));

    onImagesChange([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    if (images[index].is_primary && newImages.length > 0) {
      newImages[0].is_primary = true;
    }
    onImagesChange(newImages);
  };

  const setPrimaryImage = (index: number) => {
    onImagesChange(
      images.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
          <p className="text-sm text-gray-500 mt-1">
            Upload high-quality images (recommended: 1200x1200px)
          </p>
        </div>
        <label className="cursor-pointer px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Images
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all"
          >
            <img
              src={image.preview}
              alt={`Product ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {image.is_primary && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-md">
                Primary
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!image.is_primary && (
                <button
                  type="button"
                  onClick={() => setPrimaryImage(index)}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  title="Set as primary"
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
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
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                title="Remove"
              >
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {images.length === 0 && (
          <label className="col-span-4 aspect-video border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all">
            <svg
              className="w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm font-medium text-gray-700">Click to upload images</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
};
