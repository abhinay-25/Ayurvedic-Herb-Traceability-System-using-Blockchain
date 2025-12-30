"use client";

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Import types
interface MapWrapperProps {
  center?: [number, number];
  zoom?: number;
  selectedPosition?: [number, number] | null;
  onPositionSelect?: (position: [number, number]) => void;
  markers?: Array<{
    position: [number, number];
    popup: string;
    icon?: any;
  }>;
  height?: string;
  className?: string;
  interactive?: boolean;
}

// Dynamic import with no SSR to completely avoid server-side issues
const DynamicMapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const DynamicTileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const DynamicMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const DynamicPopup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export function MapWrapper({
  center = [20.5937, 78.9629],
  zoom = 6,
  selectedPosition,
  onPositionSelect,
  markers = [],
  height = "400px",
  className = "",
  interactive = true,
}: MapWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef<any>(null);

  // Mount only on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Force complete remount when center or zoom changes
  useEffect(() => {
    if (mounted) {
      setMapKey(prev => prev + 1);
    }
  }, [center?.[0], center?.[1], zoom, mounted]);

  // Handle map click
  const handleMapClick = (e: any) => {
    if (interactive && onPositionSelect) {
      onPositionSelect([e.latlng.lat, e.latlng.lng]);
    }
  };

  if (!mounted) {
    return (
      <div className={`relative ${className}`} style={{ height }}>
        <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center border">
          <div className="text-gray-500">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div key={mapKey} className={`relative ${className}`} style={{ height }}>
      <DynamicMapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        scrollWheelZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
        attributionControl={true}
        zoomControl={true}
      >
        <DynamicTileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Selected position marker */}
        {selectedPosition && (
          <DynamicMarker position={selectedPosition}>
            <DynamicPopup>
              <div className="text-center">
                <strong>Selected Location</strong>
                <br />
                Lat: {selectedPosition[0].toFixed(6)}
                <br />
                Lng: {selectedPosition[1].toFixed(6)}
              </div>
            </DynamicPopup>
          </DynamicMarker>
        )}
      </DynamicMapContainer>
      
      {/* Instructions overlay for interactive maps */}
      {interactive && onPositionSelect && (
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 p-2 rounded-md shadow-md text-xs z-[1000]">
          Click on the map to select location
        </div>
      )}
    </div>
  );
}