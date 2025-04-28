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
import { X, Plus } from "lucide-react";

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
  initialState?: {
    selectedCardId: string;
    selectedProducts: SelectedProduct[];
    currentProduct: Product | null;
  };
  onStateChange?: (state: {
    selectedCardId: string;
    selectedProducts: SelectedProduct[];
    currentProduct: Product | null;
  }) => void;
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

  const calculateTotalPoints = () => {
    return selectedProducts.reduce((total, item) => {
      return total + ((item.product.points_value || 0) * item.quantity);
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

    const totalAmount = calculateTotal();
    const totalPoints = selectedProducts.reduce((sum, item) => {
      return sum + (item.product.points_value || 0) * item.quantity;
    }, 0);

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
          pointValue: item.product.points_value || 0,
        })),
        totalAmount,
        totalPoints,
      });

      toast.success(`Transaction added! ${totalPoints > 0 ? `+${totalPoints} points earned` : ''}`);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-auto">
        {/* Left Column - Card and Product Selection */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-3">Card Selection</h3>
            <div>
              <Label>Select Card</Label>
              <Select onValueChange={setSelectedCardId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select card" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{card.uid}</span>
                        <span className="truncate">{card.profiles?.full_name || "No Name"}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-3">Add Products</h3>
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
                  <SelectContent className="max-h-60">
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex justify-between items-center">
                          <span>{product.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">₱{product.base_price}</span>
                            {product.points_value > 0 && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                +{product.points_value} pts
                              </span>
                            )}
                          </div>
                        </div>
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
                <div className="w-24">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="isAddOn"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={currentIsAddOn}
                    onChange={(e) => setCurrentIsAddOn(e.target.checked)}
                  />
                  <Label htmlFor="isAddOn" className="text-sm font-medium">
                    Is Add-On?
                  </Label>
                </div>
              </div>

              {currentProduct && (
                <div className="text-sm text-gray-500">
                  This will add: <span className="font-medium text-green-600">
                    {(currentProduct.points_value || 0) * currentQuantity} points
                  </span>
                </div>
              )}

              <Button 
                type="button" 
                onClick={handleAddProduct}
                className="w-full mt-2"
                variant="secondary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="bg-gray-50 p-4 rounded-lg h-full flex flex-col">
          <h3 className="font-medium text-lg mb-3">Order Summary</h3>
          
          {selectedProducts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>No products added yet</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto space-y-3">
                {selectedProducts.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-3 border rounded-lg bg-white">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">
                          {item.product.name} × {item.quantity}
                        </p>
                        <p className="font-medium">
                          ₱{(getFinalPrice(item.product, item.size) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.temperature && <span>Temp: {item.temperature}</span>}
                        {item.isAddOn && <span className="text-indigo-600">Add-On</span>}
                      </div>
                      {item.product.points_value > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          +{(item.product.points_value * item.quantity)} points
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduct(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between font-medium">
                  <span>Subtotal:</span>
                  <span>₱{calculateTotal().toFixed(2)}</span>
                </div>
                {calculateTotalPoints() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Total Points:</span>
                    <span>+{calculateTotalPoints()}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <DialogFooter className="border-t pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!selectedCardId || selectedProducts.length === 0}
        >
          Submit Transaction
        </Button>
      </DialogFooter>
    </>
  );
}