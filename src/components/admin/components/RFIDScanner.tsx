import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Radio } from 'lucide-react';

interface RFIDScannerProps {
  onScan: (uid: string) => void;
  onError?: (error: string) => void;
}

export function RFIDScanner({ onScan }: RFIDScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState('');

  useEffect(() => {
    if (!isScanning) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for numeric keys during scan
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        setLastScanned(prev => prev + e.key);
      }
      
      // Assuming reader sends Enter after UID
      if (e.key === 'Enter') {
        e.preventDefault();
        if (lastScanned.length > 0) {
          onScan(lastScanned);
          setLastScanned('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScanning, lastScanned, onScan]);

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Radio className="h-5 w-5" />
          <h3 className="font-medium">RFID Scanner</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {isScanning 
            ? 'Scanning... (Place card near reader)' 
            : 'Click start to begin scanning'}
        </p>
      </div>
      <Button 
        variant={isScanning ? 'destructive' : 'default'}
        onClick={() => setIsScanning(!isScanning)}
      >
        {isScanning ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Stop Scanning
          </>
        ) : 'Start Scanning'}
      </Button>
    </div>
  );
}