'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/lib/hooks/inventory/use-inventory';

export function StockSummary() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatus, setStockStatus] = useState('all');
  
  const { products, isLoading } = useInventory();

  const getStockStatus = (inStock: number, minStock: number = 10) => {
    if (inStock <= 0) return 'out';
    if (inStock <= minStock) return 'low';
    return 'ok';
  };

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'out':
        return <Badge variant="destructive">Out of Stock</Badge>;
      case 'low':
        return <Badge variant="warning">Low Stock</Badge>;
      default:
        return <Badge variant="default">In Stock</Badge>;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by SKU or product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="bows">Bows</SelectItem>
            <SelectItem value="arrows">Arrows</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
          </SelectContent>
        </Select>
        <Select value={stockStatus} onValueChange={setStockStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in">In Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead className="text-right">In Stock</TableHead>
              <TableHead className="text-right">Reserved</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const inStock = 100; // Replace with actual stock data
              const reserved = 20; // Replace with actual reserved data
              const available = inStock - reserved;
              const status = getStockStatus(available);

              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>{product.full_product_name}</TableCell>
                  <TableCell className="text-right">{inStock}</TableCell>
                  <TableCell className="text-right">{reserved}</TableCell>
                  <TableCell className="text-right">{available}</TableCell>
                  <TableCell>{getStockBadge(status)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}