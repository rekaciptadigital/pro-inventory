'use client';

import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from './form-schema';
import { usePriceCategories } from '@/lib/hooks/use-price-categories';

interface CustomerPricesProps {
  form: UseFormReturn<ProductFormValues>;
}

export function CustomerPrices({ form }: CustomerPricesProps) {
  const { categories } = usePriceCategories();
  const [useCustomMultipliers, setUseCustomMultipliers] = useState<{ [key: string]: boolean }>({});
  const basePriceAdjusted = form.watch('basePriceAdjusted') || 0;
  const customerPrices = form.watch('customerPrices');
  const multipliers = form.watch('multipliers') || {};

  const handleMultiplierChange = (categoryKey: string, value: string) => {
    const numValue = value === '' ? 1 : parseFloat(value);
    form.setValue(`multipliers.${categoryKey}`, numValue);
    
    // Calculate price directly from Base Price Adjusted
    const price = Math.round(basePriceAdjusted * numValue);
    form.setValue(`customerPrices.${categoryKey}`, price);
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Customer Category Prices</h3>
        <div className="text-sm text-muted-foreground">
          Base Price Adjusted: Rp {basePriceAdjusted.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => {
          const categoryKey = category.name.toLowerCase();
          const price = customerPrices?.[categoryKey] || 0;
          const currentMultiplier = multipliers[categoryKey] || category.multiplier;
          const markup = ((currentMultiplier - 1) * 100).toFixed(0);
          const isCustom = useCustomMultipliers[categoryKey];

          return (
            <div key={category.id} className="space-y-4 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <FormLabel>{category.name} Price Settings</FormLabel>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Custom Multiplier</span>
                  <Switch
                    checked={isCustom}
                    onCheckedChange={(checked) => {
                      const newState = { ...useCustomMultipliers, [categoryKey]: checked };
                      setUseCustomMultipliers(newState);
                      if (!checked) {
                        // Reset to default multiplier
                        handleMultiplierChange(categoryKey, category.multiplier.toString());
                      }
                    }}
                  />
                </div>
              </div>

              {isCustom && (
                <FormField
                  control={form.control}
                  name={`multipliers.${categoryKey}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Multiplier</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={category.multiplier.toString()}
                          value={field.value || category.multiplier}
                          onChange={(e) => handleMultiplierChange(categoryKey, e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name={`customerPrices.${categoryKey}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        value={price.toLocaleString()}
                        className="bg-muted"
                        disabled
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      {markup}% markup from Base Price Adjusted
                      {isCustom && ' (Custom)'}
                    </p>
                  </FormItem>
                )}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Price Calculation Formula</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {categories.map((category) => {
            const categoryKey = category.name.toLowerCase();
            const currentMultiplier = multipliers[categoryKey] || category.multiplier;
            const isCustom = useCustomMultipliers[categoryKey];

            return (
              <li key={category.id}>
                • {category.name}: Base Price Adjusted × {currentMultiplier} ({((currentMultiplier - 1) * 100).toFixed(0)}% markup)
                {isCustom && ' (Custom)'}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}