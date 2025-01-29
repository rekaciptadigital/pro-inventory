'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaxForm } from '@/components/taxes/tax-form';
import { TaxList } from '@/components/taxes/tax-list';
import { useTaxes } from '@/lib/hooks/use-taxes';

export default function TaxesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState<Tax | undefined>();
  const { taxes, addTax, updateTax, deleteTax } = useTaxes();

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedTax(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tax Management</h1>
          <p className="text-muted-foreground">
            Manage your tax rates and configurations
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Tax
        </Button>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedTax(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTax ? 'Edit Tax' : 'Add New Tax'}
            </DialogTitle>
            <DialogDescription>
              {selectedTax 
                ? 'Edit tax details below'
                : 'Add a new tax rate to your system'
              }
            </DialogDescription>
          </DialogHeader>
          <TaxForm
            onSuccess={handleSuccess}
            initialData={selectedTax}
          />
        </DialogContent>
      </Dialog>

      <TaxList
        taxes={taxes}
        onEdit={setSelectedTax}
        onDelete={deleteTax}
      />
    </div>
  );
}