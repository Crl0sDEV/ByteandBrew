import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types";
import TemperatureBadge from "./TemperatureBadge";

export default function ProductCard({ product }: { product: Product }) {
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
        <div className="mt-auto pt-4">
          <p className="font-bold text-lg">₱{product.base_price.toFixed(2)}</p>
          {product.has_sizes && (
            <p className="text-xs text-muted-foreground mt-1">
              *Available in multiple sizes
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}