import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2, ImageIcon } from "lucide-react";
import { Product } from "../types";
import { ProductForm } from "./ProductForm";
import { useState } from "react";
import { Card as UICard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

interface ProductsTabProps {
  products: Product[];
  loading: boolean;
  onCreate: (product: Omit<Product, 'id' | 'created_at'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Product>) => Promise<void>;
  onDelete: (id: string, image_url: string | null) => Promise<void>;
}

export function ProductsTab({ 
  products, 
  loading, 
  onCreate, 
  onUpdate, 
  onDelete 
}: ProductsTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  if (loading) {
    return <div className="flex justify-center p-8">Loading products...</div>;
  }

  return (
    <div className="space-y-4">
      <UICard>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Products Management</CardTitle>
              <CardDescription>Manage your cafe products and menu items</CardDescription>
            </div>
            <Button 
              onClick={() => {
                setEditingProduct(null);
                setIsFormOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{product.description}</TableCell>
                      <TableCell>₱{product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.points_value}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.is_active ? 'bg-black text-white' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this product?')) {
                                onDelete(product.id, product.image_url);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </UICard>

      <ProductForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={editingProduct}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
}