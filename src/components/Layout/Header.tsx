import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-background sticky top-0 z-10 border-b p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left - Navigation */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
            Home
          </a>
          <a href="/menu" className="text-muted-foreground hover:text-primary transition-colors">
            Products
          </a>
          <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
            Contact
          </a>
        </nav>

        {/* Center - Brand */}
        <h1 className="text-2xl font-bold text-custom absolute left-1/2 transform -translate-x-1/2">
          BYTE & BREW
        </h1>

        {/* Right - Login Button */}
        <div className="ml-auto">
          <a href="/auth">
            <Button variant="outline" className="text-custom">
              Login
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}