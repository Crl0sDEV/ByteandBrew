import { Badge } from "@/components/ui/badge";

export default function TemperatureBadge({ temperature }: { temperature: string }) {
  switch (temperature) {
    case "hot":
      return <Badge variant="destructive">Hot</Badge>;
    case "cold":
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-500">
          Cold
        </Badge>
      );
    case "both":
      return (
        <div className="flex gap-1">
          <Badge variant="destructive">Hot</Badge>
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Cold
          </Badge>
        </div>
      );
    default:
      return null;
  }
}