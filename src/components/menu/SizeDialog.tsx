import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SIZE_OPTIONS } from "./productHelpers";
import { Product } from "@/lib/types";

export default function SizeDialog({
  open,
  onOpenChange,
  product,
  onSelectSize,
  onSelectSizeWithTemperature,
  selectedTemperature
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSelectSize: (size: string) => void;
  onSelectSizeWithTemperature?: (size: string) => void;
  selectedTemperature?: string;
}) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Size</DialogTitle>
          <DialogDescription>
            Choose your preferred size for {product.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {SIZE_OPTIONS.map((size) => (
            <Button
              key={size.value}
              variant="outline"
              className="justify-between"
              onClick={() =>
                selectedTemperature && onSelectSizeWithTemperature
                  ? onSelectSizeWithTemperature(size.value)
                  : onSelectSize(size.value)
              }
            >
              <span>{size.label}</span>
              <span>+₱{size.priceModifier.toFixed(2)}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}