import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Radio, Scan } from "lucide-react";

interface RFIDScannerProps {
  onScan: (uid: string) => void;
  onError?: (error: string) => void;
  active?: boolean;
  onReset?: () => void;
}

export function RFIDScanner({
  onScan,
  active = true,
  onReset,
}: RFIDScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState("");

  useEffect(() => {
    if (!active) {
      setIsScanning(false);
      setLastScanned("");
    }
  }, [active]);

  useEffect(() => {
    if (!isScanning) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        setLastScanned((prev) => prev + e.key);
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (lastScanned.length > 0) {
          onScan(lastScanned);
          setLastScanned("");
          if (!active) {
            setIsScanning(false);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isScanning, lastScanned, onScan, active]);

  const toggleScanning = () => {
    if (isScanning) {
      setIsScanning(false);
      setLastScanned("");
    } else {
      setIsScanning(true);
      if (onReset) onReset();
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="h-5 w-5" />
            <h3 className="font-medium">RFID Scanner</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {isScanning
              ? "Scanning... (Place card near reader)"
              : "Click start to begin scanning"}
          </p>
        </div>
        <Button
          variant={isScanning ? "destructive" : "default"}
          onClick={toggleScanning}
          disabled={!active}
        >
          {isScanning ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Stop Scanning
            </>
          ) : (
            <>
              <Scan className="mr-2 h-4 w-4" />
              Start Scanning
            </>
          )}
        </Button>
      </div>

      {lastScanned && (
        <div className="p-2 bg-muted/50 rounded text-sm">
          <span className="font-medium">Current input: </span>
          {lastScanned}
        </div>
      )}
    </div>
  );
}
