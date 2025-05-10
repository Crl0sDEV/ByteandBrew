import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card as UICard,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Card as LoyaltyCard, Product } from "../types";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RFIDScanner } from "./RFIDScanner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const SIZE_OPTIONS = [
  { value: "small", label: "S(12oz)", priceModifier: 0 },
  { value: "medium", label: "M(16oz)", priceModifier: 10 },
  { value: "large", label: "L(20oz)", priceModifier: 20 },
] as const;

interface SelectedProduct {
  product: Product;
  size: string | null;
  sizePrice: number | null;
  temperature: string | null;
  isAddOn: boolean;
  quantity: number;
}

interface ManualTransactionCardProps {
  cards: LoyaltyCard[];
  products: Product[];
  onSubmit: (data: any) => Promise<void>;
}

export function ManualTransactionCard({
  cards,
  products,
  onSubmit,
}: ManualTransactionCardProps) {
  const POINTS_EXPIRATION_DAYS = 15;
  const [selectedCardId, setSelectedCardId] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [currentSize, setCurrentSize] = useState<string | null>(null);
  const [currentSizePrice, setCurrentSizePrice] = useState<number | null>(null);
  const [currentTemperature, setCurrentTemperature] = useState<string | null>(null);
  const [currentIsAddOn, setCurrentIsAddOn] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [scannedUid, setScannedUid] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const categories = [
    "all",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ] as string[];
  
  const filteredProducts =
    selectedCategory === "all"
      ? products.filter((p) => p.is_active)
      : products.filter((p) => p.is_active && p.category === selectedCategory);

  const handleCardScan = (uid: string) => {
    setScannedUid(uid);
    const card = cards.find((card) => card.uid === uid);
    if (card) {
      setSelectedCardId(card.id);
    } else {
      toast.error("Card not found. Please scan a registered card.");
    }
  };

  const getFinalPrice = (product: Product, sizePrice: number | null) => {
    const basePrice = Number(product.base_price) || 0;
    return sizePrice !== null ? basePrice + sizePrice : basePrice;
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      const price = getFinalPrice(item.product, item.sizePrice);
      return total + price * item.quantity;
    }, 0);
  };

  const calculateTotalPoints = () => {
    return selectedProducts.reduce((total, item) => {
      return total + (item.product.points_value || 0) * item.quantity;
    }, 0);
  };

  const handleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddProducts = () => {
    if (selectedProductIds.length === 0) {
      toast.error("Please select at least one product.");
      return;
    }

    const newSelectedProducts = selectedProductIds.map((productId) => {
      const product = products.find((p) => p.id === productId);
      return {
        product: product!,
        size: currentSize,
        sizePrice: currentSizePrice,
        temperature: currentTemperature,
        isAddOn: currentIsAddOn,
        quantity: currentQuantity,
      };
    });

    setSelectedProducts([...selectedProducts, ...newSelectedProducts]);
    setSelectedProductIds([]);
    setCurrentSize(null);
    setCurrentSizePrice(null);
    setCurrentTemperature(null);
    setCurrentIsAddOn(false);
    setCurrentQuantity(1);
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedCardId || selectedProducts.length === 0) {
      toast.error("Please scan a card and add at least one product.");
      return;
    }
  
    const totalAmount = calculateTotal();
    const totalPoints = calculateTotalPoints();
    
    const pointsExpiresAt = totalPoints > 0 
      ? new Date(Date.now() + POINTS_EXPIRATION_DAYS * 24 * 60 * 60 * 1000).toISOString()
      : null;
  
    try {
      await onSubmit({
        cardId: selectedCardId,
        items: selectedProducts.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          basePrice: item.product.base_price,
          finalPrice: getFinalPrice(item.product, item.sizePrice),
          size: item.size,
          sizePrice: item.sizePrice,
          hasSizes: item.product.has_sizes,
          category: item.product.category,
          temperature: item.temperature,
          isAddOn: item.isAddOn,
          quantity: item.quantity,
          pointValue: item.product.points_value || 0,
        })),
        totalAmount,
        totalPoints,
        pointsExpiresAt,
      });
  
      toast.success(
        `Transaction added! ${
          totalPoints > 0 
            ? `+${totalPoints} points earned${pointsExpiresAt ? ` (expires in ${POINTS_EXPIRATION_DAYS} days)` : ''}` 
            : ""
        }`
      );
      setSelectedCardId("");
      setSelectedProducts([]);
      setScannedUid(null);
    } catch (error: any) {
      toast.error("Failed to add transaction", {
        description: error.message,
      });
    }
  };

const selectedCard = cards.find((card) => card.id === selectedCardId);
const hasSizesSelected = selectedProductIds.some((id) => {
    const product = products.find((p) => p.id === id);
    return product?.has_sizes;
});


const availableSizes = SIZE_OPTIONS.filter(option => {
    return selectedProductIds.some(id => {
        const product = products.find(p => p.id === id);
        return product?.has_sizes && Array.isArray(product.sizes) && product.sizes.includes(option.value);
    });
});

  return (
    <UICard>
      <CardHeader>
        <CardTitle>Create Manual Transaction</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
          {/* Left Column - Add Products */}
          <div className="bg-gray-50 p-4 rounded-lg h-full flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-2 px-2 w-full">
              <h3 className="font-medium text-lg">Add Products</h3>
              <div className="w-[150px]">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent className="w-[180px]">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Grid - Updated with fixed height */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 p-2 max-h-[500px] overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`relative border rounded-lg p-2 cursor-pointer transition-all h-[250px] flex flex-col ${
                    selectedProductIds.includes(product.id)
                      ? "ring-2 ring-primary bg-primary/10"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleProductSelection(product.id)}
                >
                  <div className="absolute top-2 right-2">
                    <Checkbox
                      checked={selectedProductIds.includes(product.id)}
                      onCheckedChange={() =>
                        handleProductSelection(product.id)
                      }
                      className="h-5 w-5 rounded-full border-2 border-primary data-[state=checked]:bg-primary"
                    />
                  </div>

                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-24 object-cover rounded-md mb-2"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-200 rounded-md mb-2 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                  <div className="flex-1 flex flex-col justify-between">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {product.name}
                    </h4>
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-primary font-bold">
                          ₱{product.base_price}
                        </span>
                        {product.points_value > 0 && (
                          <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                            +{product.points_value} pts
                          </span>
                        )}
                      </div>
                      {product.category && (
                        <span className="text-xs text-gray-500">
                          {product.category}
                        </span>
                      )}
                    {product.has_sizes && Array.isArray(product.sizes) && (
                        <div className="text-xs text-gray-500">
                            Sizes: {product.sizes.join(", ")}
                        </div>
                    )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Product Options */}
            <div className="space-y-4 border-t pt-4">
              {hasSizesSelected && (
                <div>
                  <Label>Size (for selected products)</Label>
                  <Select
                    onValueChange={(value) => {
                      if (value === "none") {
                        setCurrentSize(null);
                        setCurrentSizePrice(null);
                      } else {
                        const selectedOption = SIZE_OPTIONS.find(opt => opt.value === value);
                        if (selectedOption) {
                          setCurrentSize(selectedOption.value);
                          setCurrentSizePrice(selectedOption.priceModifier);
                        }
                      }
                    }}
                    value={currentSize || "none"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select size</SelectItem>
                      {availableSizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label} (+₱{size.priceModifier})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Temperature (optional)</Label>
                <Select
                  onValueChange={(value) =>
                    setCurrentTemperature(value === "none" ? null : value)
                  }
                  value={currentTemperature || "none"}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Select temperature" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select temperature</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                    <SelectItem value="iced">Iced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-24">
                  <Label className="mb-2">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="isAddOn"
                    checked={currentIsAddOn}
                    onCheckedChange={(checked) =>
                      setCurrentIsAddOn(checked as boolean)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Label htmlFor="isAddOn" className="text-sm font-medium">
                    Is Add-On?
                  </Label>
                </div>
              </div>

              {selectedProductIds.length > 0 && (
                <div className="text-sm text-gray-500">
                  This will add:{" "}
                  <span className="font-medium text-green-600">
                    {selectedProductIds.reduce((sum, id) => {
                      const product = products.find((p) => p.id === id);
                      return (
                        sum + (product?.points_value || 0) * currentQuantity
                      );
                    }, 0)}{" "}
                    points
                  </span>
                </div>
              )}

              <Button
                type="button"
                onClick={handleAddProducts}
                className="w-full mt-2"
                variant="secondary"
                disabled={selectedProductIds.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add{" "}
                {selectedProductIds.length > 0
                  ? `${selectedProductIds.length} Products`
                  : "Products"}
              </Button>
            </div>
          </div>

          {/* Right Column - Card Selection and Order Summary */}
          <div className="px-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-4">
                <RFIDScanner onScan={handleCardScan} />

                {scannedUid && (
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Scanned Card: {scannedUid}</p>
                    {selectedCard ? (
                      <div className="mt-2 space-y-1 text-sm">
                        <p>
                          Member:{" "}
                          {selectedCard.profiles?.full_name || "No Name"}
                        </p>
                        <p>Points: {selectedCard.points}</p>
                        <Badge
                          variant={
                            selectedCard.status === "active"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {selectedCard.status}
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-sm text-red-500 mt-1">
                        Card not registered
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg min-h-[500px] flex flex-col">
              <h3 className="font-medium text-lg mb-3">Order Summary</h3>

              {selectedProducts.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <p>No products added yet</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-auto space-y-3">
                    {selectedProducts.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-start p-3 border rounded-lg bg-white"
                      >
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">
                              {item.product.name} × {item.quantity}
                            </p>
                            <p className="font-medium">
                              ₱
                              {(
                                getFinalPrice(item.product, item.sizePrice) *
                                item.quantity
                              ).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                            {item.size && (
                              <span>
                                Size: {SIZE_OPTIONS.find(s => s.value === item.size)?.label || item.size}
                                {item.sizePrice !== null && ` (+₱${item.sizePrice})`}
                              </span>
                            )}
                            {item.temperature && (
                              <span>Temp: {item.temperature}</span>
                            )}
                            {item.isAddOn && (
                              <span className="text-indigo-600">Add-On</span>
                            )}
                          </div>
                          {item.product.points_value > 0 && (
                            <p className="text-xs text-green-600 mt-1">
                              +{item.product.points_value * item.quantity}{" "}
                              points
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
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={handleSubmit}
            disabled={!selectedCardId || selectedProducts.length === 0}
            className="w-full sm:w-auto"
          >
            Submit Transaction
          </Button>
        </div>
      </CardContent>
    </UICard>
  );
}