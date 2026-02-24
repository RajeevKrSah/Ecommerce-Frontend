/**
 * Custom hook for managing product form state and logic
 * @module admin/products/hooks/useProductForm
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { adminService } from '@/services/admin.service';
import { variantService } from '@/services/variant.service';
import { Product, ProductFormData, VariantFormData, ProductImage, FormStep } from '../types';
import { Attribute } from '@/types/variant';

interface UseProductFormProps {
  product?: Product | null;
  mode: 'create' | 'edit';
  attributes: Attribute[];
  onSave: (product: Product) => void;
}

export const useProductForm = ({ product, mode, attributes, onSave }: UseProductFormProps) => {
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState<FormStep>('basic');
  const [saving, setSaving] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);
  
  // Form data state
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    slug: product?.sku?.toLowerCase().replace(/\s+/g, '-') || '',
    description: '',
    short_description: '',
    price: product?.price || '',
    sale_price: product?.sale_price || '',
    sku: product?.sku || '',
    stock_quantity: product?.stock_quantity || '',
    category_id: product?.category?.id || '',
    is_active: product?.is_active ?? true,
    is_featured: false,
    has_variants: false,
  });

  // Image state
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Variant state
  const [selectedAttributes, setSelectedAttributes] = useState<number[]>([]);
  const [variants, setVariants] = useState<VariantFormData[]>([]);
  const [generatingVariants, setGeneratingVariants] = useState(false);

  // Size and Color state
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [selectedColors, setSelectedColors] = useState<number[]>([]);

  // Load product data when editing
  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        name: product.name,
        slug: product.sku.toLowerCase().replace(/\s+/g, '-'),
        description: '',
        short_description: '',
        price: product.price,
        sale_price: product.sale_price || '',
        sku: product.sku,
        stock_quantity: product.stock_quantity,
        category_id: product.category?.id || '',
        is_active: product.is_active ?? true,
        is_featured: false,
        has_variants: product.has_variants || false,
      });
    }
  }, [mode, product]);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const uploadImages = async (productId: number): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const image of images) {
      if (!image.file) {
        console.warn('Skipping image without file');
        continue;
      }
      
      // Debug: Check if file is valid
      console.log('Uploading image:', {
        name: image.file.name,
        type: image.file.type,
        size: image.file.size,
        isFile: image.file instanceof File,
      });
      
      const imageFormData = new FormData();
      imageFormData.append('image', image.file, image.file.name);
      imageFormData.append('is_primary', image.is_primary ? '1' : '0');
      
      try {
        // Use adminService which handles authentication properly
        const response = await adminService.uploadProductImage(productId, imageFormData);
        console.log('Upload successful:', response);
        uploadedUrls.push(response.image_url || response.image?.image_url);
      } catch (error: any) {
        console.error('Failed to upload image:', error);
        addToast({
          type: 'error',
          message: error.message || 'Failed to upload image',
        });
      }
    }
    
    return uploadedUrls;
  };

  const generateVariantCombinations = () => {
    if (selectedAttributes.length === 0) {
      addToast({ type: 'error', message: 'Please select at least one attribute' });
      return;
    }

    setGeneratingVariants(true);
    
    const selectedAttrValues = selectedAttributes.map(attrId => {
      const attr = attributes.find(a => a.id === attrId);
      return attr?.values || [];
    });

    const combinations: number[][] = [];
    const generate = (current: number[], depth: number) => {
      if (depth === selectedAttrValues.length) {
        combinations.push([...current]);
        return;
      }
      
      for (const value of selectedAttrValues[depth]) {
        current.push(value.id);
        generate(current, depth + 1);
        current.pop();
      }
    };
    
    generate([], 0);

    const newVariants: VariantFormData[] = combinations.map((combo) => {
      const skuParts = combo.map(valueId => {
        for (const attr of attributes) {
          const value = attr.values.find(v => v.id === valueId);
          if (value) return value.code.toUpperCase();
        }
        return '';
      });
      
      return {
        sku: `${formData.sku}-${skuParts.join('-')}`,
        price: formData.price.toString(),
        stock_quantity: '0',
        attribute_values: combo,
      };
    });

    setVariants(newVariants);
    setGeneratingVariants(false);
    addToast({ 
      type: 'success', 
      message: `Generated ${newVariants.length} variant combinations` 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 'basic') {
      await handleBasicSubmit();
    } else if (currentStep === 'variants' && createdProduct) {
      await handleVariantsSubmit();
    }
  };

  const handleBasicSubmit = async () => {
    setSaving(true);
    
    try {
      const submitData: any = {
        name: formData.name,
        slug: formData.slug,
        price: Number(formData.price),
        sku: formData.sku,
        stock_quantity: formData.has_variants ? 0 : Number(formData.stock_quantity),
        is_active: Boolean(formData.is_active),
        is_featured: Boolean(formData.is_featured),
      };
      
      if (formData.description) submitData.description = formData.description;
      if (formData.short_description) submitData.short_description = formData.short_description;
      if (formData.sale_price) submitData.sale_price = Number(formData.sale_price);
      if (formData.category_id) submitData.category_id = Number(formData.category_id);
      
      // Add sizes and colors
      if (selectedSizes.length > 0) submitData.sizes = selectedSizes;
      if (selectedColors.length > 0) submitData.colors = selectedColors;
      
      let result;
      if (mode === 'create') {
        result = await adminService.createProduct(submitData);
        setCreatedProduct(result);
      } else if (product) {
        result = await adminService.updateProduct(product.id, submitData);
      }
      
      if (!result) {
        throw new Error('No result returned from server');
      }
      
      if (images.length > 0 && result.id) {
        setUploadingImages(true);
        try {
          await uploadImages(result.id);
        } catch (error) {
          console.error('Failed to upload some images:', error);
          addToast({
            type: 'warning',
            message: 'Product created but some images failed to upload',
          });
        } finally {
          setUploadingImages(false);
        }
      }
      
      if (formData.has_variants && mode === 'create') {
        setCurrentStep('variants');
        addToast({
          type: 'success',
          message: 'Product created! Now add variants.',
        });
      } else {
        onSave(result);
        addToast({
          type: 'success',
          message: `Product ${mode === 'create' ? 'created' : 'updated'} successfully`,
        });
      }
    } catch (error: any) {
      console.error(`Failed to ${mode} product:`, error);
      
      let errorMessage = `Failed to ${mode} product`;
      
      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.entries(errors).map(([field, messages]: [string, any]) => {
          const msgArray = Array.isArray(messages) ? messages : [messages];
          return `${field}: ${msgArray.join(', ')}`;
        });
        errorMessage = errorMessages.join('\n');
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      addToast({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleVariantsSubmit = async () => {
    if (!createdProduct) return;
    
    setSaving(true);
    
    try {
      let successCount = 0;
      for (const variant of variants) {
        try {
          await variantService.createVariant(createdProduct.id, {
            sku: variant.sku,
            price: Number(variant.price),
            stock_quantity: Number(variant.stock_quantity),
            attribute_values: variant.attribute_values,
            is_active: true,
          });
          successCount++;
        } catch (error) {
          console.error('Failed to create variant:', error);
        }
      }
      
      if (successCount > 0) {
        addToast({
          type: 'success',
          message: `Created ${successCount} of ${variants.length} variants successfully`,
        });
        onSave(createdProduct);
      } else {
        throw new Error('Failed to create any variants');
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Failed to create variants',
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    // State
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
    
    // Setters
    setCurrentStep,
    setFormData,
    setImages,
    setSelectedAttributes,
    setVariants,
    setSelectedSizes,
    setSelectedColors,
    
    // Handlers
    handleNameChange,
    handleSubmit,
    generateVariantCombinations,
  };
};
