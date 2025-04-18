// components/admin/components/ProductForm.tsx
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Label } from "@/components/ui/label";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { useForm } from "react-hook-form";
  import { Product } from "../types";
  import { Switch } from "@/components/ui/switch";
  import { useState, useRef, useEffect } from "react";
import { uploadProductImage, deleteProductImage } from "@/lib/uploadImage";
import { Upload } from "lucide-react";
  
interface ProductFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    onCreate: (product: Omit<Product, 'id' | 'created_at'>) => Promise<void>;
    onUpdate: (id: string, updates: Partial<Product>) => Promise<void>;
    onDelete: (id: string, image_url: string | null) => Promise<void>;
  }
  
  export function ProductForm({ open, onOpenChange, product, onCreate, onUpdate }: ProductFormProps) {
    const [previewImage, setPreviewImage] = useState<string | null>(product?.image_url || null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
  
    const { register, handleSubmit, reset, setValue } = useForm<Product>({
      defaultValues: product || {
        name: "",
        description: "",
        price: 0,
        points_value: 0,
        is_active: true,
        image_url: null,
      },
    });

    const handleOpenChange = (open: boolean) => {
        if (!open) {
          setPreviewImage(null);
        }
        onOpenChange(open);
      };

      useEffect(() => {
        reset(product || {
          name: "",
          description: "",
          price: 0,
          points_value: 0,
          is_active: true,
          image_url: null,
        });
        setPreviewImage(product?.image_url || null);
      }, [product, open, reset]);
      

    const onSubmit = async (data: Product) => {
        try {
          if (product) {
            await onUpdate(product.id, data);
          } else {
            await onCreate(data);
          }
          onOpenChange(false);
          reset();
        } catch (error) {
          console.error("Error saving product:", error);
          // TODO: Show error toast
        }
      };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
    
        setIsUploading(true);
        try {
          // Remove old image if exists
          if (previewImage) {
            await deleteProductImage(previewImage);
          }
    
          const imageUrl = await uploadProductImage(file);
          setValue("image_url", imageUrl);
          setPreviewImage(imageUrl);
        } catch (error) {
          console.error("Error uploading image:", error);
        } finally {
          setIsUploading(false);
        }
      };
    
      const removeImage = async () => {
        if (previewImage) {
          await deleteProductImage(previewImage);
        }
        setPreviewImage(null);
        setValue("image_url", null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
  
    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {product ? "Edit Product" : "Add New Product"}
            </DialogTitle>
             <DialogDescription>
    {"Add a new Product to the table or edit an existing one."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                {...register("name", { required: true })}
                placeholder="Enter product name"
              />
            </div>
            <div className="space-y-2">
            <Label>Product Image</Label>
            {previewImage ? (
              <div className="relative group">
                <img
                  src={previewImage}
                  alt="Product preview"
                  className="w-full h-48 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={removeImage}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
            {isUploading && <p className="text-sm text-muted-foreground">Uploading image...</p>}
          </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="Enter product description"
              />
            </div>
            <div className="flex gap-4">
  <div className="flex-1 space-y-2">
    <Label htmlFor="price">Price (₱)</Label>
    <Input
      id="price"
      type="number"
      step="0.01"
      min="0"
      {...register("price", { required: true, valueAsNumber: true, min: 0, })}
      placeholder="Enter price"
    />
  </div>
  <div className="flex-1 space-y-2">
    <Label htmlFor="points_value">Points Value</Label>
    <Input
      id="points_value"
      type="number"
      min="1"
      {...register("points_value", { required: true, valueAsNumber: true, min: 1, })}
      placeholder="Enter points value"
    />
  </div>
</div>

            <div className="flex items-center space-x-2">
              <Switch id="is_active" {...register("is_active")} />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Product</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }