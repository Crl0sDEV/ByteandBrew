import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ProductCard from "../components/menu/ProductCard";
import Layout from "@/components/Layout/Layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const getUniqueCategories = (products: Product[]): string[] => {
  const categories = new Set<string>();
  products.forEach(product => {
    if (product.category) {
      categories.add(product.category);
    }
  });
  return ['all', ...Array.from(categories).sort()];
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

  const categories = useMemo(() => getUniqueCategories(products), [products]);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

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
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Apply temperature filter
    if (temperatureFilter !== "all") {
      result = result.filter(p => p.temperature === temperatureFilter);
    }

    // Apply size filter
    if (sizeFilter !== "all") {
      result = result.filter(p => 
        p.has_sizes && p.sizes && p.sizes.includes(sizeFilter)
      );
    }

    // Apply price filter
    if (priceFilter !== "all") {
      const [min, max] = priceFilter.split("-").map(Number);
      result = result.filter(p => {
        const price = p.base_price || p.price;
        return price >= min && (isNaN(max) ? true : price <= max);
      });
    }

    // Apply sorting
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => (a.base_price || a.price) - (b.base_price || b.price));
        break;
      case "price-desc":
        result.sort((a, b) => (b.base_price || b.price) - (a.base_price || a.price));
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Default sorting (keep original order)
        break;
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, sortOption, priceFilter, temperatureFilter, sizeFilter]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setSortOption("default");
    setPriceFilter("all");
    setTemperatureFilter("all");
    setSizeFilter("all");
  };

  if (loading) {
    return (
      <Layout showCartButton={false}>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4"
          initial="hidden"
          animate="show"
          variants={container}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} variants={item}>
              <Card className="animate-pulse">
                <CardHeader className="h-40 bg-muted rounded-t-lg" />
                <CardContent className="h-6 bg-muted mt-2 rounded" />
                <CardContent className="h-4 bg-muted mt-1 rounded w-1/2" />
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Layout>
    );
  }

  return (
    <Layout showCartButton={false}>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="container mx-auto px-4 py-6"
      >
        {/* Category Tabs Section with Filter Button */}
        <div className="mb-6 bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button 
              variant="outline"
              onClick={() => setShowFilterDialog(true)}
              className="text-sm"
            >
              Filters
            </Button>
          </div>
          <Tabs 
            value={selectedCategory} 
            onValueChange={setSelectedCategory}
            className="w-full"
          >
            <TabsList className="flex w-full overflow-x-auto pb-2 gap-2">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="px-4 py-2 text-sm font-medium whitespace-nowrap capitalize"
                >
                  {category === "all" ? "All Categories" : category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
  
        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Filters</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">Price Range</label>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
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
                <label className="block text-sm font-medium mb-1">Temperature</label>
                <Select value={temperatureFilter} onValueChange={setTemperatureFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select temperature" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Temperatures</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
  
              {/* Size Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">Size</label>
                <Select value={sizeFilter} onValueChange={setSizeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="Small">Small</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
  
              {/* Sort Option */}
              <div>
                <label className="block text-sm font-medium mb-1">Sort By</label>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A-Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
  
              {/* Reset Button */}
              <div className="mt-4 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="text-sm"
                >
                  Reset All Filters
                </Button>
                <Button 
                  onClick={() => setShowFilterDialog(false)}
                  className="text-sm"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
  
        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <motion.div className="text-center py-12" variants={item}>
            <p className="text-lg text-muted-foreground">No products found with current filters</p>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={item}
                  layout
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
}