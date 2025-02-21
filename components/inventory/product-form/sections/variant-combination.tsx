'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VariantTypeSelector } from '../selectors/variant-type-selector';
import { VariantValueSelector } from '../selectors/variant-value-selector';
import type { ProductFormValues } from '../form-schema';

interface VariantCombinationProps {
  form: UseFormReturn<ProductFormValues>;
}

export function VariantCombination({ form }: VariantCombinationProps) {
  const [selectedVariants, setSelectedVariants] = useState<Array<{
    typeId: string;
    values: string[];
  }>>([]);

  const handleAddVariant = () => {
    setSelectedVariants(prev => [...prev, { typeId: '', values: [] }]);
  };

  const handleRemoveVariant = (index: number) => {
    setSelectedVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleTypeChange = (index: number, typeId: string) => {
    setSelectedVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], typeId, values: [] };
      return updated;
    });
  };

  const handleValuesChange = (index: number, values: string[]) => {
    setSelectedVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], values };
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Variant Combinations</h3>
        <Button onClick={handleAddVariant} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>

      {selectedVariants.map((variant, index) => (
        <div key={index} className="flex gap-4 items-start">
          <div className="flex-1">
            <VariantTypeSelector
              value={variant.typeId}
              onChange={(typeId) => handleTypeChange(index, typeId)}
            />
          </div>
          <div className="flex-1">
            <VariantValueSelector
              typeId={variant.typeId}
              values={variant.values}
              onChange={(values) => handleValuesChange(index, values)}
              disabled={!variant.typeId}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveVariant(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}