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

interface VariantTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function VariantTypeSelector({
  value,
  onChange,
  disabled = false,
}: VariantTypeSelectorProps) {
  const { variantTypes } = useVariantTypes();
  const selectedType = variantTypes.find(type => type.id === value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedType ? selectedType.name : "Select variant type"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search variant types..." />
          <CommandEmpty>No variant type found.</CommandEmpty>
          <CommandGroup>
            {variantTypes.map((type) => (
              <CommandItem
                key={type.id}
                value={type.id.toString()}
                onSelect={() => onChange(type.id.toString())}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === type.id.toString() ? "opacity-100" : "opacity-0"
                  )}
                />
                {type.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}