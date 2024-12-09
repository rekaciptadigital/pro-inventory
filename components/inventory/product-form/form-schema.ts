import * as z from 'zod';

export const productFormSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  productTypeId: z.string().min(1, 'Product type is required'),
  sku: z.string(),
  fullProductName: z.string(),
  vendorSku: z.string().optional(),
  productName: z.string().min(1, 'Product name is required'),
  unit: z.enum(['PC', 'PACK', 'SET']),
  hbReal: z.number().min(0, 'HB Real must be greater than 0'),
  adjustmentPercentage: z.number().min(0, 'Adjustment percentage must be greater than or equal to 0'),
  hbNaik: z.number(),
  usdPrice: z.number().min(0, 'USD Price must be greater than 0'),
  exchangeRate: z.number().min(0, 'Exchange rate must be greater than 0'),
  customerPrices: z.record(z.string(), z.number()),
  multipliers: z.record(z.string(), z.number()).optional(),
  variants: z.array(z.object({
    typeId: z.string(),
    values: z.array(z.string()),
  })).optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;