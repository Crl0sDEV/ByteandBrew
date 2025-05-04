import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-background sticky top-0 z-50 border-b p-4">
      <div className="container mx-auto flex items-center justify-between relative">
        {/* Mobile Menu Button (Left) */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Center - Brand */}
        <h1 className="text-xl md:text-2xl font-bold text-custom md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
          <Link to="/">BYTE & BREW</Link>
        </h1>

        {/* Desktop Navigation (Center) */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/menu" className="text-muted-foreground hover:text-primary transition-colors">
            Products
          </Link>
          <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>

        {/* Desktop Login Button (Hidden on mobile) */}
        <div className="hidden md:block ml-auto md:ml-0">
          <Link to="/auth">
            <Button variant="outline" className="text-custom">
              Login
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b shadow-lg md:hidden z-50">
            <nav className="flex flex-col p-4 gap-4">
              <Link
                to="/"
                className="text-muted-foreground hover:text-primary transition-colors py-2 px-4 rounded-md hover:bg-gray-100"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link
                to="/menu"
                className="text-muted-foreground hover:text-primary transition-colors py-2 px-4 rounded-md hover:bg-gray-100"
                onClick={toggleMenu}
              >
                Products
              </Link>
              <Link
                to="/contact"
                className="text-muted-foreground hover:text-primary transition-colors py-2 px-4 rounded-md hover:bg-gray-100"
                onClick={toggleMenu}
              >
                Contact
              </Link>
              <div className="pt-2 mt-2 border-t">
                <Link to="/auth" className="w-full">
                  <Button variant="outline" className="text-custom w-full" onClick={toggleMenu}>
                    Login
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}