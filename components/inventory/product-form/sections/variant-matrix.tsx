'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/utils/format';
import type { VariantCombination } from '@/lib/utils/variant/combinations';

interface VariantMatrixProps {
  combinations: VariantCombination[];
  baseSku: string;
  basePrice: number;
  onPriceChange: (sku: string, price: number) => void;
  onStatusChange: (sku: string, status: boolean) => void;
}

export function VariantMatrix({
  combinations,
  baseSku,
  basePrice,
  onPriceChange,
  onStatusChange,
}: VariantMatrixProps) {
  if (!combinations.length) return null;

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Variant Combination</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {combinations.map((combination, index) => {
            const variantSku = `${baseSku}-${index + 1}`;
            const variantName = combination.values
              .sort((a, b) => a.order - b.order)
              .map(v => v.valueName)
              .join(' ');

            return (
              <TableRow key={variantSku}>
                <TableCell>{variantName}</TableCell>
                <TableCell className="font-mono">{variantSku}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    defaultValue={basePrice}
                    onChange={(e) => onPriceChange(variantSku, Number(e.target.value))}
                    className="w-32 text-right"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    defaultChecked={true}
                    onCheckedChange={(checked) => onStatusChange(variantSku, checked)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}