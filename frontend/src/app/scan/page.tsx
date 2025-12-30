"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "../../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Camera, QrCode, Upload, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface ScanResult {
  text: string;
  herbId?: string;
  isValid: boolean;
}

export default function QRScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const extractHerbIdFromUrl = (url: string): string | null => {
    try {
      // Extract herb ID from URLs like:
      // http://localhost:3000/herbs/herb_001
      // https://myapp.com/herbs/herb_002
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/');
      const herbsIndex = pathSegments.indexOf('herbs');
      
      if (herbsIndex !== -1 && pathSegments[herbsIndex + 1]) {
        return pathSegments[herbsIndex + 1];
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const validateAndProcessScan = (text: string): ScanResult => {
    const herbId = extractHerbIdFromUrl(text);
    
    if (herbId) {
      return {
        text,
        herbId,
        isValid: true
      };
    } else {
      return {
        text,
        isValid: false
      };
    }
  };

  const startCamera = useCallback(async () => {
    try {
      setScanning(true);
      setError(null);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setCameraPermission('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Handle video play with proper error handling
        try {
          await videoRef.current.play();
        } catch (playError) {
          // Handle play() promise rejection (AbortError, etc.)
          console.warn('Video play interrupted:', playError);
          // Don't throw error, just continue with QR setup
        }

        // Initialize QR code reader
        codeReader.current = new BrowserMultiFormatReader();
        
        codeReader.current.decodeFromVideoDevice(
          null, // Use default video device
          videoRef.current,
          (result, error) => {
            if (result) {
              const scanResult = validateAndProcessScan(result.getText());
              setScanResult(scanResult);
              
              if (scanResult.isValid && scanResult.herbId) {
                toast.success('QR Code scanned successfully!');
                stopCamera();
                
                // Redirect to herb details page
                setTimeout(() => {
                  router.push(`/herbs/${scanResult.herbId}`);
                }, 1500);
              } else {
                toast.error('Invalid QR code - not an herb traceability link');
              }
            }
            
            if (error && !(error instanceof NotFoundException)) {
              console.error('QR scan error:', error);
            }
          }
        );
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraPermission('denied');
      setError('Unable to access camera. Please check permissions.');
      setScanning(false);
    }
  }, [router]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (codeReader.current) {
      codeReader.current.reset();
    }
    
    setScanning(false);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imageSrc = e.target?.result as string;
        
        if (!codeReader.current) {
          codeReader.current = new BrowserMultiFormatReader();
        }

        const result = await codeReader.current.decodeFromImageUrl(imageSrc);
        const scanResult = validateAndProcessScan(result.getText());
        setScanResult(scanResult);
        
        if (scanResult.isValid && scanResult.herbId) {
          toast.success('QR Code detected in image!');
          
          // Redirect to herb details page
          setTimeout(() => {
            router.push(`/herbs/${scanResult.herbId}`);
          }, 1500);
        } else {
          toast.error('Invalid QR code in image - not an herb traceability link');
        }
      } catch (err) {
        console.error('Image scan error:', err);
        toast.error('No QR code found in the image');
      }
    };
    
    reader.readAsDataURL(file);
  };

  const manualEntry = () => {
    const herbId = prompt('Enter Herb ID manually (e.g., herb_001):');
    if (herbId && herbId.trim()) {
      router.push(`/herbs/${herbId.trim()}`);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <QrCode className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Scan Herb QR Code
            </h1>
            <p className="text-gray-600">
              Scan a QR code to view the complete herb traceability journey
            </p>
          </div>

          {/* Camera Scanner */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Camera Scanner
              </CardTitle>
              <CardDescription>
                Use your device camera to scan QR codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!scanning && !scanResult && (
                <div className="text-center space-y-4">
                  <div className="bg-gray-100 rounded-lg p-8">
                    <Camera className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-4">
                      Position the QR code within the camera frame
                    </p>
                    <Button onClick={startCamera} size="lg">
                      <Camera className="h-5 w-5 mr-2" />
                      Start Camera
                    </Button>
                  </div>
                  
                  {cameraPermission === 'denied' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Camera Access Denied</span>
                      </div>
                      <p className="text-xs text-red-700 mt-1">
                        Please enable camera permissions in your browser settings
                      </p>
                    </div>
                  )}
                </div>
              )}

              {scanning && (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-64 object-cover"
                      playsInline
                      muted
                    />
                    <div className="absolute inset-0 border-4 border-white/30 rounded-lg">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-48 h-48 border-2 border-primary rounded-lg border-dashed animate-pulse"></div>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      <Loader2 className="h-3 w-3 inline animate-spin mr-1" />
                      Scanning...
                    </div>
                  </div>
                  
                  <Button onClick={stopCamera} variant="outline" className="w-full">
                    Stop Camera
                  </Button>
                </div>
              )}

              {scanResult && (
                <div className="space-y-4">
                  <div className={`border rounded-lg p-4 ${
                    scanResult.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {scanResult.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`font-medium ${
                        scanResult.isValid ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {scanResult.isValid ? 'Valid Herb QR Code' : 'Invalid QR Code'}
                      </span>
                    </div>
                    
                    {scanResult.isValid && scanResult.herbId && (
                      <div className="space-y-2">
                        <p className="text-sm text-green-700">
                          <strong>Herb ID:</strong> {scanResult.herbId}
                        </p>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Redirecting to herb journey...
                        </Badge>
                      </div>
                    )}
                    
                    <details className="mt-3">
                      <summary className="text-xs text-gray-600 cursor-pointer">
                        Show scanned URL
                      </summary>
                      <code className="text-xs bg-white p-2 rounded border mt-2 block break-all">
                        {scanResult.text}
                      </code>
                    </details>
                  </div>
                  
                  <Button onClick={() => setScanResult(null)} variant="outline" className="w-full">
                    Scan Another Code
                  </Button>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Image
              </CardTitle>
              <CardDescription>
                Upload an image containing a QR code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image File
                </Button>
                <p className="text-xs text-gray-600 mt-2">
                  Supports JPG, PNG, and other image formats
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Manual Entry */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Entry</CardTitle>
              <CardDescription>
                Enter herb ID directly if you can't scan the QR code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={manualEntry} variant="outline" className="w-full">
                Enter Herb ID Manually
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}