import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";

export default function TemperatureDialog({
  open,
  onOpenChange,
  product,
  temperature,
  onTemperatureChange,
  onContinue
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  temperature: string;
  onTemperatureChange: (temp: string) => void;
  onContinue: () => void;
}) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Temperature</DialogTitle>
          <DialogDescription>
            Choose your preferred temperature for {product.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Button
            variant={temperature === "hot" ? "default" : "outline"}
            onClick={() => onTemperatureChange("hot")}
          >
            Hot
          </Button>
          <Button
            variant={temperature === "cold" ? "default" : "outline"}
            onClick={() => onTemperatureChange("cold")}
          >
            Cold
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={onContinue}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}