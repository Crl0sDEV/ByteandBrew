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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onCreate: (product: Omit<Product, "id" | "created_at">) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Product>) => Promise<void>;
  onDelete: (id: string, image_url: string | null) => Promise<void>;
}

// Size options configuration
const SIZE_OPTIONS = [
  { value: "small", label: "S(12oz)", priceModifier: 0 },
  { value: "medium", label: "M(16oz)", priceModifier: 10 },
  { value: "large", label: "L(20oz)", priceModifier: 20 },
];

// Category options
const CATEGORIES = [
  { value: "coffee", label: "Coffee" },
  { value: "flavored-coffee", label: "Flavored Coffee" },
  { value: "iced-tea", label: "Iced Tea" },
  { value: "cold-brew", label: "Cold Brew" },
  { value: "non-coffee", label: "Non-Coffee" },
  { value: "fizzy-drinks", label: "Fizzy Drinks" },
  { value: "frappe", label: "Frappe" },
  { value: "add-ons", label: "Add-ons" },
];

export function ProductForm({
  open,
  onOpenChange,
  product,
  onCreate,
  onUpdate,
}: ProductFormProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(
    product?.image_url || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    product?.sizes || []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Product>({
    defaultValues: product || {
      name: "",
      description: "",
      base_price: 0,
      points_value: 0,
      is_active: true,
      image_url: null,
      has_sizes: false,
      sizes: [],
      category: "",
      is_add_on: false,
    },
  });

  const hasSizes = watch("has_sizes");
  const isAddOn = watch("is_add_on");

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPreviewImage(null);
      setSelectedSizes([]);
    }
    onOpenChange(open);
  };

  useEffect(() => {
    if (product) {
      reset({
        ...product,
        base_price: product.base_price || product.price || 0,
        is_add_on: product.category === "add-ons" || false,
        is_active: product.is_active !== false 
      });
      setPreviewImage(product.image_url || null);
      setSelectedSizes(product.sizes || []);
    } else {
      reset({
        name: "",
        description: "",
        base_price: 0,
        points_value: 0,
        is_active: true,
        image_url: null,
        has_sizes: false,
        sizes: [],
        category: "",
        is_add_on: false,
      });
      setPreviewImage(null);
      setSelectedSizes([]);
    }
  }, [product, open, reset]);

  const toggleSize = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];

    setSelectedSizes(newSizes);
    setValue("sizes", newSizes);
  };

  const handleCategoryChange = (value: string) => {
    setValue("category", value);
    setValue("is_add_on", value === "add-ons");
    if (value === "add-ons") {
      setValue("has_sizes", false);
      setSelectedSizes([]);
    }
  };

  const onSubmit = async (data: Product) => {
    try {
      const productData = {
        ...data,
        sizes: hasSizes && !isAddOn ? selectedSizes : [],
        price: data.base_price, // Maintain backward compatibility
      };

      if (product) {
        await onUpdate(product.id, productData);
      } else {
        await onCreate(productData);
      }
      handleOpenChange(false);
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
      <DialogContent className="max-w-2xl">
        {" "}
        {/* Increased max width */}
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Update the product details"
              : "Add a new product to the menu"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Product name is required" })}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Image and details side by side */}
          <div className="flex gap-4">
            {/* Left side - Product Image */}
            <div className="w-1/2 space-y-2">
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
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
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
              {isUploading && (
                <p className="text-sm text-muted-foreground">
                  Uploading image...
                </p>
              )}
            </div>

            {/* Right side - Category, Price, Points */}
            <div className="w-1/2 space-y-4">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={watch("category")}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Base Price */}
              <div className="space-y-2">
                <Label htmlFor="base_price">Price (₱)</Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("base_price", {
                    required: "Price is required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Price must be positive" },
                  })}
                  placeholder="Enter price"
                />
                {errors.base_price && (
                  <p className="text-sm text-red-500">
                    {errors.base_price.message}
                  </p>
                )}
              </div>

              {/* Points Value */}
              <div className="space-y-2">
                <Label htmlFor="points_value">Points Value</Label>
                <Input
                  id="points_value"
                  type="number"
                  min="1"
                  {...register("points_value", {
                    required: "Points value is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Points must be at least 1" },
                  })}
                  placeholder="Enter points"
                />
                {errors.points_value && (
                  <p className="text-sm text-red-500">
                    {errors.points_value.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Enter product description"
            />
          </div>

          {/* Switches row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Active Switch */}
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={watch("is_active")}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            {/* Size Options Section - Hidden for Add-ons */}
            {!isAddOn && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="has_sizes"
                  checked={hasSizes}
                  onCheckedChange={(checked) => {
                    setValue("has_sizes", checked);
                    if (!checked) {
                      setSelectedSizes([]);
                      setValue("sizes", []);
                    }
                  }}
                />
                <Label htmlFor="has_sizes">Has size options</Label>
              </div>
            )}
          </div>

          {/* Size options buttons - shown only when has_sizes is true */}
          {!isAddOn && hasSizes && (
            <div className="space-y-2">
              <Label>Available Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((size) => (
                  <Button
                    key={size.value}
                    type="button"
                    variant={
                      selectedSizes.includes(size.value) ? "default" : "outline"
                    }
                    onClick={() => toggleSize(size.value)}
                  >
                    {size.label} (+₱{size.priceModifier})
                  </Button>
                ))}
              </div>
              {selectedSizes.length === 0 && (
                <p className="text-sm text-red-500">
                  Please select at least one size
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                (!isAddOn && hasSizes && selectedSizes.length === 0) ||
                !watch("category")
              }
            >
              {product ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
