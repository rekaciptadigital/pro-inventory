'use client';

import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils/format';
import type { ProductFormValues } from '../form-schema';

interface VariantPricingProps {
  form: UseFormReturn<ProductFormValues>;
  variantSku: string;
}

export function VariantPricing({ form, variantSku }: VariantPricingProps) {
  const handlePriceChange = (value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    form.setValue(`variantPrices.${variantSku}`, numericValue);
  };

  const price = form.watch(`variantPrices.${variantSku}`) || 0;

  return (
    <FormField
      control={form.control}
      name={`variantPrices.${variantSku}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Price</FormLabel>
          <FormControl>
            <Input
              type="number"
              min="0"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              className="text-right"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}