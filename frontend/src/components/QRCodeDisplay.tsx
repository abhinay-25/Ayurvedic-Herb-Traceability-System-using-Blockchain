"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Download, QrCode, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  herbId: string;
  herbName: string;
  currentStatus: string;
}

interface QRCodeData {
  herbId: string;
  herbName: string;
  url: string;
  qrCode: string;
  base64: string;
  format: string;
  size: string;
}

export function QRCodeDisplay({ herbId, herbName, currentStatus }: QRCodeDisplayProps) {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show QR code for final products
  const showQRCode = currentStatus.toLowerCase().includes('final') || 
                     currentStatus.toLowerCase().includes('formul') ||
                     currentStatus.toLowerCase().includes('complete');

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:8080/api/herbs/${herbId}/qrcode`);
      
      if (!response.ok) {
        throw new Error(`Failed to generate QR code: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setQrData(result.data);
        toast.success('QR code generated successfully!');
      } else {
        throw new Error(result.error || 'Failed to generate QR code');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrData) return;

    try {
      // Convert base64 to blob
      const byteCharacters = atob(qrData.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `herb-${herbId}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('QR code downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download QR code');
      console.error('Download error:', err);
    }
  };

  const copyQRLink = () => {
    if (!qrData) return;

    navigator.clipboard.writeText(qrData.url).then(
      () => {
        toast.success('QR link copied to clipboard!');
      },
      (err) => {
        toast.error('Failed to copy link');
        console.error('Copy error:', err);
      }
    );
  };

  if (!showQRCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Product QR Code
          </CardTitle>
          <CardDescription>
            QR codes are available for final formulated products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <QrCode className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600">
              Product must reach "Final Formulation" status to generate QR code
            </p>
            <Badge variant="outline" className="mt-2">
              Current: {currentStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Product QR Code
        </CardTitle>
        <CardDescription>
          Generate QR code for product packaging and consumer verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qrData && !loading && (
          <div className="text-center">
            <Button 
              onClick={generateQRCode} 
              className="w-full"
              size="lg"
            >
              <QrCode className="h-5 w-5 mr-2" />
              Generate QR Code
            </Button>
            <p className="text-xs text-gray-600 mt-2">
              This will create a scannable QR code linking to the herb's journey
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-6">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-gray-600 mt-2">Generating QR code...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-4">
            <div className="text-red-500 text-sm mb-3">{error}</div>
            <Button onClick={generateQRCode} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        )}

        {qrData && (
          <div className="space-y-4">
            {/* QR Code Image */}
            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200">
                <img 
                  src={qrData.qrCode} 
                  alt={`QR Code for ${qrData.herbName}`}
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Size: {qrData.size} • Format: {qrData.format.toUpperCase()}
              </p>
            </div>

            {/* QR Code Info */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Herb:</span>
                <span className="font-medium">{qrData.herbName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ID:</span>
                <span className="font-mono text-xs">{qrData.herbId}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Link:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-white px-2 py-1 rounded border flex-1 truncate">
                    {qrData.url}
                  </code>
                  <Button
                    onClick={copyQRLink}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={downloadQRCode} variant="default" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
              <Button onClick={generateQRCode} variant="outline" className="w-full">
                <QrCode className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </div>

            {/* Usage Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 text-sm mb-2">Usage Instructions:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Print this QR code on product packaging</li>
                <li>• Consumers can scan to view complete herb journey</li>
                <li>• Links to blockchain-verified traceability data</li>
                <li>• Works on any QR scanner or smartphone camera</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}