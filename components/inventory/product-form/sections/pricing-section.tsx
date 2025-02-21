'use client';

import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils/format';
import type { ProductFormValues } from '../form-schema';

interface PricingSectionProps {
  form: UseFormReturn<ProductFormValues>;
}

export function PricingSection({ form }: PricingSectionProps) {
  const handleNumericChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: {
      onChange: (value: number) => void;
      onBlur: () => void;
    }
  ) => {
    const value = e.target.value;
    const numberValue = value === '' ? 0 : parseFloat(value);
    field.onChange(numberValue);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pricing Information</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="usdPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>USD Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter USD price"
                  value={field.value || ''}
                  onChange={(e) => handleNumericChange(e, field)}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="exchangeRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exchange Rate (KURS)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="Enter exchange rate"
                  value={field.value || ''}
                  onChange={(e) => handleNumericChange(e, field)}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <FormLabel>HB Real (Base Price)</FormLabel>
        <div className="text-2xl font-bold mt-1">
          {formatCurrency(form.watch('hbReal') || 0)}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Automatically calculated: USD Price × Exchange Rate
        </p>
      </div>

      <FormField
        control={form.control}
        name="adjustmentPercentage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Adjustment Percentage (%)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="Enter adjustment percentage"
                value={field.value || ''}
                onChange={(e) => handleNumericChange(e, field)}
                onBlur={field.onBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="bg-muted/50 p-4 rounded-lg">
        <FormLabel>HB Naik (Adjusted Price)</FormLabel>
        <div className="text-2xl font-bold mt-1">
          {formatCurrency(form.watch('hbNaik') || 0)}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Automatically calculated: HB Real × (1 + Adjustment/100)
        </p>
      </div>
    </div>
  );
}