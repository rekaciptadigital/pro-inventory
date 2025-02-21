'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useVariantTypes } from '@/lib/hooks/use-variant-types';

interface VariantValueSelectorProps {
  typeId: string;
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}

export function VariantValueSelector({
  typeId,
  values,
  onChange,
  disabled = false,
}: VariantValueSelectorProps) {
  const { variantTypes } = useVariantTypes();
  const variantType = variantTypes.find(type => type.id === typeId);

  const toggleValue = (value: string) => {
    const newValues = values.includes(value)
      ? values.filter(v => v !== value)
      : [...values, value];
    onChange(newValues);
  };

  if (!variantType) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Select variant type first
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
          disabled={disabled}
        >
          {values.length > 0
            ? `${values.length} selected`
            : "Select values"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search values..." />
          <CommandEmpty>No values found.</CommandEmpty>
          <CommandGroup>
            {variantType.values.map((value) => (
              <CommandItem
                key={value.id}
                value={value.name}
                onSelect={() => toggleValue(value.name)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    values.includes(value.name) ? "opacity-100" : "opacity-0"
                  )}
                />
                {value.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}