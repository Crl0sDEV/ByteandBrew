import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TemperatureBadge from "./TemperatureBadge";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types";

export default function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
}) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow !p-0">
      <div className="relative aspect-square w-full">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-full bg-muted/50 flex items-center justify-center rounded-t-lg">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
      </div>
      <CardContent className="p-3 flex-1 flex flex-col">
        {/* Name and Category row */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg line-clamp-2 flex-1">
            {product.name}
          </h3>
          <Badge variant="secondary" className="shrink-0">
            {product.category}
          </Badge>
        </div>

        {/* Temperature badge or placeholder */}
        <div className="min-h-[1.5rem] mt-1">
          {product.temperature && product.temperature !== "none" ? (
            <TemperatureBadge temperature={product.temperature} />
          ) : (
            <div className="h-[1.5rem]"></div>
          )}
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm line-clamp-2 mt-2 h-[2.5rem]">
          {product.description}
        </p>

        {/* Price section */}
        <div className="mt-auto pt-4 h-[1rem]">
          {product.has_sizes ? (
            <p className="text-xs text-muted-foreground mt-1">
              *Available in multiple sizes
            </p>
          ) : (
            <div className="h-[1.25rem]"></div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center w-full gap-2">
          <div className="w-[30%] text-right pr-2">
            <p className="font-bold text-lg">₱{product.base_price.toFixed(2)}</p>
          </div>
          <Button
            onClick={() => onAddToCart(product)}
            className="w-[70%]"
            size="sm"
          >
            Add to Cart
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}