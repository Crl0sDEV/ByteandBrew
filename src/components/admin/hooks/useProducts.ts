import { useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "../types";
import { deleteProductImage } from "@/lib/uploadImage";

export function useProducts(user: User | null, shouldFetch: boolean) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createProduct = useCallback(async (product: Omit<Product, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select();
      if (error) throw error;
      return data?.[0];
    } catch (err) {
      console.error("Error creating product:", err);
      throw err;
    }
  }, []);
  
  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data?.[0];
    } catch (err) {
      console.error("Error updating product:", err);
      throw err;
    }
  }, []);  
  
  const deleteProduct = useCallback(async (id: string, image_url: string | null) => {
    try {
      if (image_url) {
        await deleteProductImage(image_url);
      }
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error("Error deleting product:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!shouldFetch) return;

    fetchProducts();

    const subscription = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "products" 
        },
        () => shouldFetch && fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [shouldFetch, fetchProducts]);

  return { 
    products, 
    loading,
    error,
    createProduct, 
    updateProduct, 
    deleteProduct,
    refreshProducts: fetchProducts
  };
}