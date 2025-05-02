import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ProductCard from "../components/menu/ProductCard";
import Layout from "@/components/Layout/Layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, Filter, X, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const getUniqueCategories = (products: Product[]): string[] => {
  const categories = new Set<string>();
  products.forEach((product) => {
    if (product.category) {
      categories.add(product.category);
    }
  });
  return ["all", ...Array.from(categories).sort()];
};

export default function ProductMenu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("default");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [temperatureFilter, setTemperatureFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const [isVisible, setIsVisible] = useState(false);

  const categories = useMemo(() => getUniqueCategories(products), [products]);

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (sortOption !== "default") count++;
    if (priceFilter !== "all") count++;
    if (temperatureFilter !== "all") count++;
    if (sizeFilter !== "all") count++;
    if (searchQuery !== "") count++;
    
    setActiveFiltersCount(count);
  }, [selectedCategory, sortOption, priceFilter, temperatureFilter, sizeFilter, searchQuery]);

  // Scroll visibility effect
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true);

        if (error) throw error;
        setProducts(data || []);
        setFilteredProducts(data || []);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Temperature filter
    if (temperatureFilter !== "all") {
      result = result.filter((p) => p.temperature === temperatureFilter);
    }

    // Size filter
    if (sizeFilter !== "all") {
      result = result.filter(
        (p) => p.has_sizes && p.sizes && p.sizes.includes(sizeFilter)
      );
    }

    // Price filter
    if (priceFilter !== "all") {
      const [min, max] = priceFilter.split("-").map(Number);
      result = result.filter((p) => {
        const price = p.base_price || p.price;
        return price >= min && (isNaN(max) ? true : price <= max);
      });
    }

    // Sort options
    switch (sortOption) {
      case "price-asc":
        result.sort(
          (a, b) => (a.base_price || a.price) - (b.base_price || b.price)
        );
        break;
      case "price-desc":
        result.sort(
          (a, b) => (b.base_price || b.price) - (a.base_price || a.price)
        );
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [
    products,
    selectedCategory,
    sortOption,
    priceFilter,
    temperatureFilter,
    sizeFilter,
    searchQuery,
  ]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setSortOption("default");
    setPriceFilter("all");
    setTemperatureFilter("all");
    setSizeFilter("all");
    setSearchQuery("");
  };

  if (loading) {
    return (
      <Layout showCartButton={false}>
        <div className="container mx-auto px-4 py-6">
          {/* Loading skeleton for header */}
          <div className="mb-8 space-y-4">
            <Skeleton className="h-10 w-1/3 rounded-lg bg-white/80" />
            <Skeleton className="h-4 w-1/2 rounded-lg bg-white/80" />
          </div>
          
          {/* Loading skeleton for tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full bg-white/80" />
            ))}
          </div>
          
          {/* Loading skeleton for product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden bg-white/95 backdrop-blur-sm">
                <Skeleton className="h-48 w-full rounded-t-lg bg-white/80" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4 rounded bg-white/80" />
                  <Skeleton className="h-4 w-1/2 rounded bg-white/80" />
                  <Skeleton className="h-4 w-1/4 rounded bg-white/80" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showCartButton={false}>
      <div className="container mx-auto px-4 py-6">
        {/* Header and Search */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Our Menu</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Discover our delicious selection of beverages and treats
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-6 text-lg bg-white/95 backdrop-blur-sm border-0 shadow-sm focus-visible:ring-2 focus-visible:ring-[#4b8e3f]"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4b8e3f]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4b8e3f] hover:text-[#3a6d32]"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filters and Categories */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Categories Tabs */}
          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full md:w-auto"
          >
            <TabsList className="flex w-full overflow-x-auto pb-2 gap-2 bg-white/95 backdrop-blur-sm">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="px-4 py-2 text-sm font-medium whitespace-nowrap capitalize data-[state=active]:bg-[#4b8e3f] data-[state=active]:text-white"
                >
                  {category === "all" ? "All" : category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Filter Button with Badge */}
          <Button
            onClick={() => setShowFilterDialog(true)}
            className="gap-2 bg-white/95 hover:bg-white text-[#4b8e3f] hover:text-[#3a6d32] backdrop-blur-sm border-0 shadow-sm"
          >
            <Filter size={16} />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-1 bg-[#4b8e3f] text-white">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-0">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between text-gray-800">
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-[#4b8e3f] flex items-center gap-1 hover:text-[#3a6d32]"
                  >
                    <RotateCcw size={14} />
                    Reset
                  </button>
                )}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Narrow down your search with these filters
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Sort Option */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Sort By</label>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-0 shadow-lg">
                    <SelectItem value="default">Recommended</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A-Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Price Range</label>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-0 shadow-lg">
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="0-100">Under ₱100</SelectItem>
                    <SelectItem value="100-200">₱100 - ₱200</SelectItem>
                    <SelectItem value="200-300">₱200 - ₱300</SelectItem>
                    <SelectItem value="300-">Over ₱300</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Temperature Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Temperature</label>
                <Select value={temperatureFilter} onValueChange={setTemperatureFilter}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select temperature" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-0 shadow-lg">
                    <SelectItem value="all">All Temperatures</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                    <SelectItem value="iced">Iced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Size Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Size</label>
                <Select value={sizeFilter} onValueChange={setSizeFilter}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-0 shadow-lg">
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="Small">Small (12oz)</SelectItem>
                    <SelectItem value="Medium">Medium (16oz)</SelectItem>
                    <SelectItem value="Large">Large (20oz)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowFilterDialog(false)}
                className="border-gray-200"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => setShowFilterDialog(false)}
                className="bg-[#4b8e3f] hover:bg-[#3a6d32]"
              >
                Show {filteredProducts.length} Items
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-white/90">Active filters:</span>
            {selectedCategory !== "all" && (
              <Badge variant="outline" className="gap-1 bg-white/80 backdrop-blur-sm">
                {selectedCategory}
                <button onClick={() => setSelectedCategory("all")}>
                  <X size={14} className="text-[#4b8e3f]" />
                </button>
              </Badge>
            )}
            {sortOption !== "default" && (
              <Badge variant="outline" className="gap-1 bg-white/80 backdrop-blur-sm">
                {sortOption.replace('-', ' ')}
                <button onClick={() => setSortOption("default")}>
                  <X size={14} className="text-[#4b8e3f]" />
                </button>
              </Badge>
            )}
            {priceFilter !== "all" && (
              <Badge variant="outline" className="gap-1 bg-white/80 backdrop-blur-sm">
                {priceFilter === "300-" ? "₱300+" : `₱${priceFilter}`}
                <button onClick={() => setPriceFilter("all")}>
                  <X size={14} className="text-[#4b8e3f]" />
                </button>
              </Badge>
            )}
            {temperatureFilter !== "all" && (
              <Badge variant="outline" className="gap-1 bg-white/80 backdrop-blur-sm">
                {temperatureFilter}
                <button onClick={() => setTemperatureFilter("all")}>
                  <X size={14} className="text-[#4b8e3f]" />
                </button>
              </Badge>
            )}
            {sizeFilter !== "all" && (
              <Badge variant="outline" className="gap-1 bg-white/80 backdrop-blur-sm">
                {sizeFilter}
                <button onClick={() => setSizeFilter("all")}>
                  <X size={14} className="text-[#4b8e3f]" />
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="outline" className="gap-1 bg-white/80 backdrop-blur-sm">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery("")}>
                  <X size={14} className="text-[#4b8e3f]" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-white hover:text-white/80 ml-2"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <motion.div 
            className="text-center py-12 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-5xl text-white">☕</div>
            <h3 className="text-xl font-medium text-white">No products found</h3>
            <p className="text-white/80">
              Try adjusting your search or filters
            </p>
            <Button 
              onClick={resetFilters} 
              variant="outline"
              className="bg-white/90 hover:bg-white text-[#4b8e3f]"
            >
              Reset all filters
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            layout
          >
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard 
                    product={product} 
                    className="bg-white/95 backdrop-blur-sm hover:shadow-lg transition-shadow"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {isVisible && (
            <motion.button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 bg-[#4b8e3f] text-white p-3 rounded-full shadow-lg hover:bg-[#3a6d32] transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowUp size={24} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}