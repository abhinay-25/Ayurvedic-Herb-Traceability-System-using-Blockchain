"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Loader2, RotateCcw } from 'lucide-react';

// Dynamic import for the simple map component
const SimpleMap = dynamic(
  () => import('./SimpleMap').then((mod) => ({ default: mod.SimpleMap })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] bg-gray-100 rounded-md flex items-center justify-center border">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
);

interface LocationSelectorProps {
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  selectedLocation?: { lat: number; lng: number; address?: string } | null;
  className?: string;
}

export function LocationSelector({
  onLocationSelect,
  selectedLocation,
  className = "",
}: LocationSelectorProps) {
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Update selected position when prop changes
  useEffect(() => {
    if (selectedLocation) {
      setSelectedPosition([selectedLocation.lat, selectedLocation.lng]);
    }
  }, [selectedLocation]);

  // Get user's current location
  const getCurrentLocation = () => {
    if (typeof window === 'undefined') {
      setLocationError("Geolocation is not available in this environment");
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude
        ];
        setCurrentPosition(coords);
        setSelectedPosition(coords);
        onLocationSelect({
          lat: coords[0],
          lng: coords[1],
          address: "Current Location"
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Handle map click to select position
  const handleMapClick = (position: [number, number]) => {
    setSelectedPosition(position);
    onLocationSelect({
      lat: position[0],
      lng: position[1],
      address: `${position[0].toFixed(6)}, ${position[1].toFixed(6)}`
    });
  };

  // Reset selection
  const resetSelection = () => {
    setSelectedPosition(null);
    setLocationError(null);
  };

  // Determine map center
  const mapCenter: [number, number] = currentPosition || selectedPosition || [20.5937, 78.9629];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Select Collection Location
        </CardTitle>
        <CardDescription>
          Click on the map to select the herb collection location, or use your current location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            variant="outline"
            size="sm"
          >
            {isLoadingLocation ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            Use Current Location
          </Button>
          
          {selectedPosition && (
            <Button
              onClick={resetSelection}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {/* Error display */}
        {locationError && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
            {locationError}
          </div>
        )}

        {/* Selected coordinates display */}
        {selectedPosition && (
          <div className="text-sm bg-green-50 p-3 rounded-md border border-green-200">
            <strong>Selected Location:</strong>
            <br />
            Latitude: {selectedPosition[0].toFixed(6)}
            <br />
            Longitude: {selectedPosition[1].toFixed(6)}
          </div>
        )}

        {/* Map component */}
        <div key={`map-container-${mapCenter[0]}-${mapCenter[1]}-${Date.now()}`} className="border rounded-md overflow-hidden">
          <SimpleMap
            center={mapCenter}
            zoom={currentPosition ? 15 : 6}
            selectedPosition={selectedPosition}
            onPositionSelect={handleMapClick}
            height="300px"
            interactive={true}
          />
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md">
          <strong>Instructions:</strong>
          <ul className="mt-1 list-disc list-inside space-y-1">
            <li>Click "Use Current Location" to automatically detect your location</li>
            <li>Or click anywhere on the map to manually select a location</li>
            <li>The selected coordinates will be saved with the herb record</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}