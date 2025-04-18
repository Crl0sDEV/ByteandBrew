import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/lib/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard, Scan, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define size options
const SIZE_OPTIONS = [
  { value: 'small', label: 'Small (12oz)', priceModifier: 0 },
  { value: 'medium', label: 'Medium (16oz)', priceModifier: 10 },
  { value: 'large', label: 'Large (20oz)', priceModifier: 20 },
];

export default function ProductMenu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{product: Product, size: string | null}[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cardData, setCardData] = useState<{
    id: string;
    balance: number;
    points: number;
  } | null>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showSizeDialog, setShowSizeDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const allCategories = products.map(p => p.category);
    return ['all', ...new Set(allCategories)];
  }, [products]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true);

        if (error) throw error;
        setProducts(data || []);
        setFilteredProducts(data || []);
      } catch (error) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products by category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  useEffect(() => {
    if (scanMode && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [scanMode]);

  const handleRFIDScan = async (rfidData: string) => {
    if (!scanMode || cart.length === 0) return;

    try {
      const { data: card, error: cardError } = await supabase
        .from("cards")
        .select("id, user_id, balance, points")
        .eq("uid", rfidData.trim())
        .single();

      if (cardError?.code === "PGRST116") {
        toast.error("This card is not registered");
        setScanMode(false);
        setIsCartOpen(false);
        return;
      }

      if (cardError || !card) {
        throw new Error(cardError?.message || "Card lookup failed");
      }

      const currentTotal = cart.reduce((sum, item) => {
        const sizeModifier = item.size 
          ? SIZE_OPTIONS.find(s => s.value === item.size)?.priceModifier || 0 
          : 0;
        return sum + item.product.base_price + sizeModifier;
      }, 0);
      if (card.balance < currentTotal) {
        toast.error(
          `Insufficient balance. Your card has ₱${card.balance.toFixed(
            2
          )} but need ₱${currentTotal.toFixed(2)}`
        );
        setScanMode(false);
        setIsCartOpen(false);
        return;
      }

      setCardData({
        id: card.id,
        balance: card.balance,
        points: card.points,
      });
      setShowConfirmation(true);
      setScanMode(false);
      setIsCartOpen(false);
    } catch (error) {
      console.error("RFID scan error:", error);
      toast.error("Failed to scan card. Please try again.");
      setScanMode(false);
      setIsCartOpen(false);
    }
  };

  const { total, pointsEarned } = useMemo(() => {
    const calculatedTotal = cart.reduce((sum, item) => {
      const sizePrice = item.size ? SIZE_OPTIONS.find(s => s.value === item.size)?.priceModifier || 0 : 0;
      return sum + (item.product.base_price + sizePrice);
    }, 0);
    const calculatedPoints = Math.floor(calculatedTotal / 100);
    return { total: calculatedTotal, pointsEarned: calculatedPoints };
  }, [cart]);

  const newBalance = useMemo(() => {
    return cardData ? cardData.balance - total : 0;
  }, [cardData, total]);

  const processPayment = async () => {
    if (!cardData || cart.length === 0) return;
  
    setPaymentLoading(true);
    try {
      const itemCount = cart.length;
      const pointsEarned = Math.floor(total / 100);
  
      // Create an array of all items in the cart with their details
  
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          card_id: cardData.id,
          amount: total,
          base_price: cart.reduce((sum, item) => sum + item.product.base_price, 0), // Sum of all base prices
          type: "payment",
          item_count: itemCount,
          status: "Pending",
          points_earned: pointsEarned,
          confirmed: false, // Store all items as JSON array
          selected_size: cart.find(item => item.size)?.size || null, // Store selected size if any
          category: cart[0]?.product.category || null, // Primary category
          is_add_on: cart.some(item => item.product.is_add_on) // True if any item is add-on
        });
  
      if (transactionError) throw transactionError;
  
      toast.success(
        `Payment request of ₱${total.toFixed(2)} submitted for admin approval`
      );
      setCart([]);
      setShowConfirmation(false);
      setCardData(null);
      setScanMode(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Payment submission failed"
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    const handleInput = (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (input.value.length > 9) {
        handleRFIDScan(input.value);
        input.value = "";
      }
    };

    const input = scanInputRef.current;
    if (input) {
      input.addEventListener("input", handleInput);
      return () => input.removeEventListener("input", handleInput);
    }
  }, [scanMode, cart]);

  const addToCart = (product: Product) => {
    if (product.has_sizes) {
      setSelectedProduct(product);
      setShowSizeDialog(true);
    } else {
      setCart([...cart, { product, size: null }]);
      toast.success(`${product.name} added to cart`);
    }
  };

  const addToCartWithSize = (size: string) => {
    if (!selectedProduct) return;
    setCart([...cart, { product: selectedProduct, size }]);
    toast.success(`${selectedProduct.name} (${SIZE_OPTIONS.find(s => s.value === size)?.label}) added to cart`);
    setShowSizeDialog(false);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const startPayment = () => {
    setScanMode(true);
    toast.info("Please scan your RFID card", { duration: 5000 });
  };

  const cancelPayment = () => {
    setScanMode(false);
    setShowConfirmation(false);
    setCardData(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-40 bg-muted rounded-t-lg" />
            <CardContent className="h-6 bg-muted mt-2 rounded" />
            <CardContent className="h-4 bg-muted mt-1 rounded w-1/2" />
            <CardFooter className="h-10 bg-muted mt-2 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden input for RFID scanner */}
      <input
        ref={scanInputRef}
        type="text"
        className="absolute opacity-0 w-0 h-0"
        autoComplete="off"
      />

      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">BYTE & BREW</h1>
        <div className="relative">
          <Button
            variant="outline"
            className="flex gap-2"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5" />
            Cart ({cart.length})
          </Button>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </div>
      </header>

      <div className="container mx-auto p-4">
        {/* Category Filter */}
        <div className="mb-6">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="p-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
                <p className="text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-2">
                  <p className="font-bold">₱{product.base_price.toFixed(2)}</p>
                  {product.has_sizes && (
                    <p className="text-xs text-muted-foreground">
                      Available in multiple sizes
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  onClick={() => addToCart(product)} 
                  className="w-full"
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Size Selection Dialog */}
        <Dialog open={showSizeDialog} onOpenChange={setShowSizeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Size</DialogTitle>
              <DialogDescription>
                Choose your preferred size for {selectedProduct?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              {SIZE_OPTIONS.map((size) => (
                <Button
                  key={size.value}
                  variant="outline"
                  className="justify-between"
                  onClick={() => addToCartWithSize(size.value)}
                >
                  <span>{size.label}</span>
                  <span>+₱{size.priceModifier.toFixed(2)}</span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Cart & Payment Section */}
        <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Your Cart</DialogTitle>
              <DialogDescription>
                Review and manage items in your shopping cart
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {cart.map((item, index) => {
                const sizePrice = item.size ? SIZE_OPTIONS.find(s => s.value === item.size)?.priceModifier || 0 : 0;
                const itemPrice = item.product.base_price + sizePrice;
                return (
                  <div
                    key={index}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">
                        {item.product.name}
                        {item.size && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({SIZE_OPTIONS.find(s => s.value === item.size)?.label})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ₱{itemPrice.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-red-500"
                      onClick={() => removeFromCart(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-4">
              <p className="font-bold">Total: ₱{total.toFixed(2)}</p>
              <Button
                onClick={() => {
                  setShowConfirmation(false);
                  startPayment();
                }}
                disabled={paymentLoading || scanMode}
                className="flex gap-2"
              >
                {paymentLoading ? (
                  "Processing..."
                ) : scanMode ? (
                  <>
                    <Scan className="w-5 h-5 animate-pulse text-blue-500" />
                    <span className="text-blue-500">Scanning Card...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay with CARD
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Confirmation Dialog */}
        <Dialog 
          open={showConfirmation} 
          onOpenChange={(open) => {
            if (!open) {
              cancelPayment();
            }
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
              <DialogDescription>
                Please review your order before confirming
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <h4 className="font-medium mb-2">Your Order:</h4>
                <ul className="max-h-40 overflow-y-auto border rounded-lg p-2">
                  {cart.map((item, index) => {
                    const sizePrice = item.size ? SIZE_OPTIONS.find(s => s.value === item.size)?.priceModifier || 0 : 0;
                    const itemPrice = item.product.base_price + sizePrice;
                    return (
                      <li key={index} className="flex justify-between py-1">
                        <span>
                          {item.product.name}
                          {item.size && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({SIZE_OPTIONS.find(s => s.value === item.size)?.label})
                            </span>
                          )}
                        </span>
                        <span>₱{itemPrice.toFixed(2)}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="font-bold mt-2 text-right">
                  Total: ₱{total.toFixed(2)}
                </p>
              </div>
              {cardData && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current Balance:</span>
                    <span>₱{cardData.balance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Balance:</span>
                    <span>₱{newBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Points Earned:</span>
                    <span>{pointsEarned}</span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={cancelPayment}>
                Cancel
              </Button>
              <Button onClick={processPayment} disabled={paymentLoading}>
                {paymentLoading ? "Processing..." : "Confirm Payment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Processing Modal */}
        {paymentLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <h3 className="text-xl font-bold text-center">
                  Processing Payment
                </h3>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-center text-muted-foreground">
                  Please wait while we process your payment...
                </p>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}