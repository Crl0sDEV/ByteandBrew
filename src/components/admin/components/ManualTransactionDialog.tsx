import { useState } from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, Product } from "../types";
import { toast } from "sonner";

interface SelectedProduct {
  product: Product;
  size: string | null;
  temperature: string | null;
  isAddOn: boolean;
  quantity: number;
}

interface ManualTransactionDialogProps {
  cards: Card[];
  products: Product[];
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}

export function ManualTransactionDialog({
  cards,
  products,
  onSubmit,
  onClose,
}: ManualTransactionDialogProps) {
  const [selectedCardId, setSelectedCardId] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentSize, setCurrentSize] = useState<string | null>(null);
  const [currentTemperature, setCurrentTemperature] = useState<string | null>(null);
  const [currentIsAddOn, setCurrentIsAddOn] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState(1);

  const getFinalPrice = (product: Product, size: string | null) => {
    const sizePrice = product.has_sizes
      ? product.sizes?.[size || ""] || 0
      : product.base_price;
    return sizePrice;
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      const price = getFinalPrice(item.product, item.size);
      return total + (price * item.quantity);
    }, 0);
  };

  const handleAddProduct = () => {
    if (!currentProduct) {
      toast.error("Please select a product.");
      return;
    }

    setSelectedProducts([
      ...selectedProducts,
      {
        product: currentProduct,
        size: currentSize,
        temperature: currentTemperature,
        isAddOn: currentIsAddOn,
        quantity: currentQuantity,
      },
    ]);

    // Reset current selection
    setCurrentProduct(null);
    setCurrentSize(null);
    setCurrentTemperature(null);
    setCurrentIsAddOn(false);
    setCurrentQuantity(1);
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedCardId || selectedProducts.length === 0) {
      toast.error("Please select a card and at least one product.");
      return;
    }

    try {
      await onSubmit({
        cardId: selectedCardId,
        items: selectedProducts.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          basePrice: item.product.base_price,
          finalPrice: getFinalPrice(item.product, item.size),
          size: item.size,
          hasSizes: item.product.has_sizes,
          category: item.product.category,
          temperature: item.temperature,
          isAddOn: item.isAddOn,
          quantity: item.quantity,
        })),
        totalAmount: calculateTotal(),
      });

      toast.success("Transaction added!");
      onClose();
    } catch (error: any) {
      toast.error("Failed to add transaction", {
        description: error.message,
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Manual Transaction</DialogTitle>
        <DialogDescription>
          Select a card and products to create a manual purchase record.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div>
          <Label>Card</Label>
          <Select onValueChange={setSelectedCardId}>
            <SelectTrigger>
              <SelectValue placeholder="Select card" />
            </SelectTrigger>
            <SelectContent>
              {cards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.uid} - {card.profiles?.full_name || "No Name"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Add Products</h3>
          
          <div className="space-y-4">
            <div>
              <Label>Product</Label>
              <Select
                onValueChange={(value) =>
                  setCurrentProduct(products.find((p) => p.id === value) || null)
                }
                value={currentProduct?.id || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - ₱{product.base_price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentProduct?.has_sizes && (
              <div>
                <Label>Size</Label>
                <Select 
                  onValueChange={setCurrentSize}
                  value={currentSize || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(currentProduct.sizes || {}).map(
                      ([size, price]) => (
                        <SelectItem key={size} value={size}>
                          {size} - ₱{price}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Temperature (optional)</Label>
              <Select 
                onValueChange={setCurrentTemperature}
                value={currentTemperature || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select temperature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                  <SelectItem value="iced">Iced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={currentQuantity}
                  onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                  className="w-20"
                />
              </div>
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="isAddOn"
                  className="mr-2"
                  checked={currentIsAddOn}
                  onChange={(e) => setCurrentIsAddOn(e.target.checked)}
                />
                <Label htmlFor="isAddOn">Is Add-On?</Label>
              </div>
            </div>

            <Button 
              type="button" 
              onClick={handleAddProduct}
              className="w-full"
            >
              Add Product
            </Button>
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Selected Products</h3>
            <div className="space-y-2">
              {selectedProducts.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">{item.product.name} × {item.quantity}</p>
                    {item.size && <p className="text-sm">Size: {item.size}</p>}
                    {item.temperature && <p className="text-sm">Temp: {item.temperature}</p>}
                    {item.isAddOn && <p className="text-sm">Add-On</p>}
                    <p className="text-sm">
                      ₱{(getFinalPrice(item.product, item.size) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProduct(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="font-semibold text-lg border-t pt-4">
          Total Price: ₱{calculateTotal().toFixed(2)}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Submit Transaction</Button>
      </DialogFooter>
    </>
  );
}