"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react"; // Add useRef
import { useFormContext } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  updateForm,
  selectProductNames,
  selectSkuInfo,
  selectVariantSelectors,
  addVariantSelector,
  updateVariantSelector,
  removeVariantSelector,
  updateVariantSelectorValues,
} from "@/lib/store/slices/formInventoryProductSlice";
import { useVariantTypes } from "@/lib/hooks/use-variant-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  VariantTypeSelector as VariantType,
  VariantValueSelector as VariantValue,
} from "./enhanced-selectors";
import type { ProductFormValues } from "./form-schema";
import type { Variant, VariantValue } from "@/types/variant";
import type { SelectOption } from "@/components/ui/enhanced-select";
import { useBrands } from "@/lib/hooks/use-brands";
import { useProductTypes } from "@/lib/hooks/use-product-types";
import { Input } from "@/components/ui/input";
import { RootState } from "@/lib/store";

interface SelectedVariant {
  id: string;
  typeId: number;
  values: string[];
  availableValues?: string[];
}

export function VariantCombinations() {
  const form = useFormContext<ProductFormValues>();
  const dispatch = useDispatch();
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>(
    []
  );
  const { variantTypes } = useVariantTypes();
  const variantSelectors = useSelector(selectVariantSelectors);
  const [variantUniqueCodes, setVariantUniqueCodes] = useState<
    Record<string, string>
  >({});
  const { full_product_name } = useSelector(selectProductNames);
  const { sku: baseSku } = useSelector(selectSkuInfo);

  const usedTypeIds = useMemo(
    () => selectedVariants.map((variant) => variant.typeId).filter(Boolean),
    [selectedVariants]
  );

  const generateVariantId = useCallback(
    () => `variant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  const handleAddVariant = useCallback(() => {
    setSelectedVariants((prev) => [
      ...prev,
      { id: generateVariantId(), typeId: 0, values: [] },
    ]);
  }, [generateVariantId]);

  const handleRemoveVariant = useCallback(
    (variantId: string) => {
      setSelectedVariants((prev) => {
        const newVariants = prev.filter((v) => v.id !== variantId);

        // Jika tidak ada variant yang tersisa, reset semua state terkait
        if (newVariants.length === 0) {
          // Reset local states
          setVariantUniqueCodes({});
          setLocalValues({});

          // Reset Redux states
          dispatch(
            updateForm({
              variants: [],
              variant_selectors: [],
              product_by_variant: [],
            })
          );
        } else {
          // Update Redux untuk variant yang dihapus
          const variantToRemove = prev.find((v) => v.id === variantId);
          if (variantToRemove?.typeId) {
            dispatch(removeVariantSelector(variantToRemove.typeId));
          }
        }

        return newVariants;
      });
    },
    [dispatch]
  );

  useEffect(() => {
    // Jika tidak ada variants yang dipilih, pastikan state Redux bersih
    if (selectedVariants.length === 0) {
      dispatch(
        updateForm({
          variants: [],
          variant_selectors: [],
          product_by_variant: [],
        })
      );
    }
  }, [selectedVariants, dispatch]);

  const handleTypeChange = useCallback(
    (variantId: string, selected: SelectOption | null) => {
      if (!selected?.data) return;

      setSelectedVariants((prev) => {
        const newVariants = prev.map((v) =>
          v.id === variantId
            ? {
                ...v,
                typeId: parseInt(selected.value),
                values: [], // Reset values when type changes
              }
            : v
        );
        return newVariants;
      });

      // Update Redux store
      dispatch(
        addVariantSelector({
          id: parseInt(selected.value),
          name: selected.data.name,
          values: selected.data.values || [],
          selected_values: [],
        })
      );
    },
    [dispatch]
  );

  const handleValuesChange = useCallback(
    (variantId: string, selected: SelectOption[]) => {
      const selectedValues = selected.map((option) => option.value);

      setSelectedVariants((prev) => {
        const newVariants = prev.map((v) =>
          v.id === variantId
            ? {
                ...v,
                values: selectedValues,
              }
            : v
        );
        return newVariants;
      });

      // Find the variant type ID outside of setState
      const variant = selectedVariants.find((v) => v.id === variantId);
      if (variant && variant.typeId) {
        // Dispatch Redux update separately
        dispatch(
          updateVariantSelectorValues({
            id: variant.typeId,
            selected_values: selectedValues,
          })
        );
      }
    },
    [dispatch, selectedVariants] // Add selectedVariants as dependency
  );

  const canShowGeneratedSkus = useMemo(() => {
    const hasValidVariants = selectedVariants.some(
      (v) => v.typeId && v.values.length > 0
    );
    return Boolean(full_product_name && baseSku && hasValidVariants);
  }, [full_product_name, baseSku, selectedVariants]);

  const variantData = useMemo(() => {
    if (!canShowGeneratedSkus) return [];

    const generateCombinations = (variants: SelectedVariant[]) => {
      if (variants.length === 0) return [[]];
      const [first, ...rest] = variants;
      const restCombinations = generateCombinations(rest);
      return first.values.flatMap((value) =>
        restCombinations.map((combo) => [value, ...combo])
      );
    };

    const combinations = generateCombinations(
      selectedVariants.filter((v) => v.values.length > 0)
    );

    return combinations.map((combo, index) => {
      const defaultUniqueCode = String(index + 1).padStart(4, "0");
      const originalSkuKey = `${baseSku}-${index + 1}`;
      const storedUniqueCode = variantUniqueCodes[originalSkuKey];
      const uniqueCode = storedUniqueCode || defaultUniqueCode;

      return {
        originalSkuKey,
        skuKey: `${baseSku}-${uniqueCode}`,
        productName: `${full_product_name} ${combo.join(" ")}`,
        uniqueCode,
        combo,
      };
    });
  }, [
    canShowGeneratedSkus,
    selectedVariants,
    baseSku,
    full_product_name,
    variantUniqueCodes,
  ]);

  useEffect(() => {
    if (!selectedVariants.length) return;

    const formattedVariants = selectedVariants
      .filter((v) => v.typeId)
      .map((variant) => {
        const variantType = variantTypes?.find(
          (vt) => vt.id === variant.typeId
        );
        return {
          variant_id: variant.typeId,
          variant_name: variantType?.name || "",
          variant_values: variant.values.map((value) => ({
            variant_value_id: 0,
            variant_value_name: value,
          })),
        };
      });

    dispatch(updateForm({ variants: formattedVariants }));

    // Update variant selectors after a small delay
    const timer = setTimeout(() => {
      selectedVariants.forEach((variant) => {
        if (variant.typeId) {
          dispatch(
            updateVariantSelectorValues({
              id: variant.typeId,
              selected_values: variant.values,
            })
          );
        }
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [selectedVariants, variantTypes, dispatch]);

  // Modifikasi pada useEffect untuk variantData
  useEffect(() => {
    if (variantData.length) {
      dispatch(
        updateForm({
          product_by_variant: variantData.map((variant) => ({
            originalSkuKey: variant.originalSkuKey,
            sku: variant.skuKey,
            sku_product_unique_code: variant.uniqueCode, // Ubah dari unique_code
            full_product_name: variant.productName, // Ubah key dari product_name ke full_product_name
          })),
        })
      );
    }
  }, [variantData, dispatch]);

  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  // Fungsi untuk update local state
  const updateLocalValue = useCallback((key: string, value: string) => {
    setLocalValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Modifikasi pada debouncedUpdateRedux
  const debouncedUpdateRedux = useCallback(
    (originalSkuKey: string, value: string) => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        setVariantUniqueCodes((prev) => ({
          ...prev,
          [originalSkuKey]: value,
        }));

        dispatch(
          updateForm({
            product_by_variant: variantData.map((variant) => ({
              originalSkuKey: variant.originalSkuKey,
              sku:
                variant.originalSkuKey === originalSkuKey
                  ? `${baseSku}-${value || "0000"}`
                  : variant.skuKey,
              sku_product_unique_code:
                variant.originalSkuKey === originalSkuKey // Ubah dari unique_code
                  ? value
                  : variant.uniqueCode,
              full_product_name: variant.productName, // Ubah key dari product_name ke full_product_name
            })),
          })
        );
      }, 300);
    },
    [baseSku, variantData, dispatch]
  );

  // Modifikasi handler untuk perubahan input
  // Modifikasi pada handleUniqueCodeChange untuk reset case
  const handleUniqueCodeChange = useCallback(
    (originalSkuKey: string, value: string) => {
      if (!value.match(/^\d*$/)) return;

      const cleanValue = value.replace(/\D/g, "").slice(0, 10);

      // Jika value kosong, hapus dari localValues untuk menggunakan default value
      if (!cleanValue) {
        setLocalValues((prev) => {
          const newValues = { ...prev };
          delete newValues[originalSkuKey];
          return newValues;
        });

        // Reset ke nilai default di Redux juga
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }

        updateTimeoutRef.current = setTimeout(() => {
          setVariantUniqueCodes((prev) => {
            const newValues = { ...prev };
            delete newValues[originalSkuKey];
            return newValues;
          });

          // Dapatkan default unique code dari variantData
          const defaultUniqueCode =
            variantData.find((v) => v.originalSkuKey === originalSkuKey)
              ?.uniqueCode || "0000";

          dispatch(
            updateForm({
              product_by_variant: variantData.map((variant) => ({
                originalSkuKey: variant.originalSkuKey,
                sku:
                  variant.originalSkuKey === originalSkuKey
                    ? `${baseSku}-${defaultUniqueCode}`
                    : variant.skuKey,
                sku_product_unique_code:
                  variant.originalSkuKey === originalSkuKey // Ubah dari unique_code
                    ? defaultUniqueCode
                    : variant.uniqueCode,
                full_product_name: variant.productName, // Ubah key dari product_name ke full_product_name
              })),
            })
          );
        }, 300);

        return;
      }

      // Normal flow untuk value yang tidak kosong
      updateLocalValue(originalSkuKey, cleanValue);
      debouncedUpdateRedux(originalSkuKey, cleanValue);
    },
    [updateLocalValue, debouncedUpdateRedux, baseSku, variantData, dispatch]
  );

  // Handler untuk blur event
  const handleInputBlur = useCallback(
    (originalSkuKey: string, value: string) => {
      const cleanValue = value.replace(/\D/g, "").slice(0, 10);
      const paddedValue =
        cleanValue.length < 4 ? cleanValue.padStart(4, "0") : cleanValue;

      updateLocalValue(originalSkuKey, paddedValue);
      debouncedUpdateRedux(originalSkuKey, paddedValue);
    },
    [updateLocalValue, debouncedUpdateRedux]
  );

  // Cleanup pada unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Render input component
  const renderUniqueCodeInput = useCallback(
    (originalSkuKey: string, uniqueCode: string) => (
      <Input
        value={localValues[originalSkuKey] ?? uniqueCode}
        onChange={(e) => handleUniqueCodeChange(originalSkuKey, e.target.value)}
        onBlur={(e) => handleInputBlur(originalSkuKey, e.target.value)}
        className="w-[120px] font-mono"
        placeholder="0000"
        maxLength={10}
        type="text"
        inputMode="numeric"
        pattern="\d*"
      />
    ),
    [localValues, handleUniqueCodeChange, handleInputBlur]
  );

  const renderVariantValue = useCallback(
    (variant: SelectedVariant, currentSelector?: any) => {
      const valueOptions = variant.values.map((value) => ({
        value: value,
        label: value,
        data: value,
      }));

      return (
        <VariantValue
          key={`value-${variant.id}-${variant.typeId}-${variant.values.join(
            ","
          )}`}
          values={currentSelector?.values || []}
          value={valueOptions}
          onChange={(selected) => handleValuesChange(variant.id, selected)}
          isDisabled={!variant.typeId}
        />
      );
    },
    [handleValuesChange]
  );

  // Modify TableCell render
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {selectedVariants.map((variant) => {
          const currentSelector = variantSelectors.find(
            (selector) => selector.id === variant.typeId
          );

          return (
            <div
              key={variant.id}
              className="flex flex-col md:grid md:grid-cols-[2fr,3fr,auto] gap-3 items-start"
            >
              <div className="w-full min-w-[180px]">
                <VariantType
                  key={`type-${variant.id}`}
                  value={
                    variant.typeId
                      ? {
                          value: variant.typeId.toString(),
                          label: currentSelector?.name || "",
                          data: {
                            id: variant.typeId,
                            name: currentSelector?.name || "",
                            values: currentSelector?.values || [],
                          },
                        }
                      : null
                  }
                  onChange={(selected) =>
                    handleTypeChange(variant.id, selected)
                  }
                  excludeIds={usedTypeIds.filter((id) => id !== variant.typeId)}
                />
              </div>
              <div className="w-full min-w-[200px]">
                {renderVariantValue(variant, currentSelector)}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="self-start mt-0"
                onClick={() => handleRemoveVariant(variant.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}

        <Button type="button" variant="outline" onClick={handleAddVariant}>
          <Plus className="mr-2 h-4 w-4" />
          Add Variant
        </Button>
      </div>

      {!canShowGeneratedSkus && variantSelectors.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Please complete the following to generate SKUs:
          <ul className="list-disc list-inside mt-2">
            {!full_product_name && <li>Product name is required</li>}
            {!baseSku && <li>Base SKU is required</li>}
            {!selectedVariants.some((v) => v.typeId && v.values.length > 0) && (
              <li>At least one variant with selected values is required</li>
            )}
          </ul>
        </div>
      )}

      {canShowGeneratedSkus && variantData.length > 0 && (
        <div className="border rounded-lg p-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Generated SKUs</h4>
            <div className="overflow-auto">
              <div className="rounded-md border min-w-[640px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">
                        Full Product Name
                      </TableHead>
                      <TableHead className="w-[30%]">SKU Variant</TableHead>
                      <TableHead className="w-[20%]">Unique Code</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variantData.map(
                      ({ originalSkuKey, skuKey, productName, uniqueCode }) => (
                        <TableRow key={skuKey}>
                          <TableCell>{productName}</TableCell>
                          <TableCell className="font-medium">
                            {skuKey}
                          </TableCell>
                          <TableCell>
                            {renderUniqueCodeInput(originalSkuKey, uniqueCode)}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
