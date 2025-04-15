import { supabase } from "@/lib/supabaseClient";

export async function uploadProductImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `product-images/${fileName}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteProductImage(url: string) {
  const filePath = url.split('product-images/')[1];
  if (!filePath) return;

  const { error } = await supabase.storage
    .from('product-images')
    .remove([filePath]);

  if (error) console.error('Error deleting image:', error);
}

// Add these to your existing uploadImage.ts
export async function uploadRewardImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `rewards-images/${fileName}`;
  
    const { error } = await supabase.storage
      .from('rewards-images')
      .upload(filePath, file);
  
    if (error) throw error;
  
    const { data: { publicUrl } } = supabase.storage
      .from('rewards-images')
      .getPublicUrl(filePath);
  
    return publicUrl;
  }
  
  export async function deleteRewardImage(url: string) {
    const filePath = url.split('rewards-images/')[1];
    if (!filePath) return;
  
    const { error } = await supabase.storage
      .from('rewards-images')
      .remove([filePath]);
  
    if (error) console.error('Error deleting reward image:', error);
  }