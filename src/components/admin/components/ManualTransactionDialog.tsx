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

interface ManualTransactionDialogProps {
  cards: Card[];
  products: Product[]; // You should define this type with id, name, base_price, sizes, etc.
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [temperature, setTemperature] = useState<string | null>(null);
  const [isAddOn, setIsAddOn] = useState(false);

  const getFinalPrice = () => {
    if (!selectedProduct) return 0;
    const sizePrice = selectedProduct.has_sizes
      ? selectedProduct.sizes?.[selectedSize || ""] || 0
      : selectedProduct.base_price;
    return sizePrice;
  };

  const handleSubmit = async () => {
    if (!selectedCardId || !selectedProduct) {
      toast.error("Please select a card and product.");
      return;
    }

    const finalPrice = getFinalPrice();
    try {
      await onSubmit({
        cardId: selectedCardId,
        amount: finalPrice,
        itemCount: 1,
        basePrice: selectedProduct.base_price,
        finalPrice,
        selectedSize,
        productSize: selectedSize,
        hasSizes: selectedProduct.has_sizes,
        category: selectedProduct.category,
        temperature,
        isAddOn,
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
          Select a card and product to create a manual purchase record.
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

        <div>
          <Label>Product</Label>
          <Select
            onValueChange={(value) =>
              setSelectedProduct(products.find((p) => p.id === value) || null)
            }
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

        {selectedProduct?.has_sizes && (
          <div>
            <Label>Size</Label>
            <Select onValueChange={setSelectedSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(selectedProduct.sizes || {}).map(
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
          <Select onValueChange={setTemperature}>
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

        <div>
          <Label>
            <input
              type="checkbox"
              className="mr-2"
              checked={isAddOn}
              onChange={(e) => setIsAddOn(e.target.checked)}
            />
            Is Add-On?
          </Label>
        </div>

        <div className="font-semibold">
          Total Price: ₱{getFinalPrice().toFixed(2)}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </DialogFooter>
    </>
  );
}
