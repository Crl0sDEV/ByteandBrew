import { Product, CartItem } from "@/lib/types";

export const SIZE_OPTIONS = [
  { value: "small", label: "Small (12oz)", priceModifier: 0 },
  { value: "medium", label: "Medium (16oz)", priceModifier: 10 },
  { value: "large", label: "Large (20oz)", priceModifier: 20 },
];

export function calculateCartTotals(cart: CartItem[]) {
  const total = cart.reduce((sum, item) => {
    const sizePrice = item.size
      ? SIZE_OPTIONS.find((s) => s.value === item.size)?.priceModifier || 0
      : 0;
    return sum + (item.product.base_price + sizePrice);
  }, 0);
  const pointsEarned = Math.floor(total / 100);
  return { total, pointsEarned };
}

export function getUniqueCategories(products: Product[]) {
  const allCategories = products.map((p) => p.category);
  return ["all", ...new Set(allCategories)];
}