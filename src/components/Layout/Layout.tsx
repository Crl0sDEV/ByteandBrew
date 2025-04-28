import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Header from "./Header";

export default function Layout({ 
  children,
  cartCount = 0,
  showCartButton = false,
  onCartClick = () => {}
}: { 
  children: React.ReactNode,
  cartCount?: number,
  showCartButton?: boolean,
  onCartClick?: () => void
}) {
  return (
    <div className="min-h-screen layout-background">
      <Header />
      
      <main className="container mx-auto p-4">
        {children}
      </main>

      {showCartButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full w-14 h-14 shadow-lg relative"
            onClick={onCartClick}
          >
            <ShoppingCart className="w-6 h-6 text-custom" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}