"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SingleProductForm } from "@/components/inventory/product-form/single-product-form";
import { useInventory } from "@/lib/hooks/inventory/use-inventory";
import { useToast } from "@/components/ui/use-toast";

export function EditProductForm() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { getProduct } = useInventory();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        const data = await getProduct(id as string);
        setProduct(data);
      } catch (error) {
        console.error("Error loading product:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load product details",
        });
        router.push("/dashboard/inventory");
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, getProduct, toast, router]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading product details...</div>;
  }

  if (!product && !isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Product not found
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-none mb-6">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">Update product information</p>
      </div>

      <div className="flex-1 border rounded-lg">
        <SingleProductForm
          initialData={product}
          onSuccess={() => {
            toast({
              title: "Success",
              description: "Product has been updated successfully",
            });
            router.push("/dashboard/inventory");
          }}
        />
      </div>
    </div>
  );
}