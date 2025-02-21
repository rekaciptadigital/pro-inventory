'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { BasicInfo } from './sections/basic-info';
import { PricingSection } from './sections/pricing-section';
import { VariantCombination } from './sections/variant-combination';
import { productFormSchema, type ProductFormValues } from './form-schema';
import type { Product } from '@/types/inventory';

interface ProductFormProps {
  onSuccess?: (product: Product) => void;
  onClose?: () => void;
  initialData?: Product;
}

export function ProductForm({ onSuccess, onClose, initialData }: ProductFormProps) {
  const { toast } = useToast();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      brand: initialData?.brand || '',
      productTypeId: initialData?.productTypeId || '',
      sku: initialData?.sku || '',
      productName: initialData?.productName || '',
      description: initialData?.description || '',
      unit: initialData?.unit || 'PC',
      variants: initialData?.variants || [],
    },
  });

  const onSubmit = async (values: ProductFormValues) => {
    try {
      // Save to localStorage for demo
      const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const newProduct = {
        id: Date.now().toString(),
        ...values,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem('products', JSON.stringify([...savedProducts, newProduct]));

      toast({
        title: 'Success',
        description: 'Product has been added successfully',
      });

      if (onSuccess) {
        onSuccess(newProduct);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save product. Please try again.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6">
        <BasicInfo form={form} />
        <PricingSection form={form} />
        <VariantCombination form={form} />

        <div className="flex justify-end space-x-4">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {initialData ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}