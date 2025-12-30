"use client";

import { useEffect, useRef, useState } from 'react';

// Custom marker icons
const createCustomIcon = (L: any, color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

interface GeoTagMapProps {
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

export function GeoTagMap({
  center = [20.5937, 78.9629], // Default to center of India
  zoom = 6,
  selectedPosition,
  onPositionSelect,
  markers = [],
  height = "400px",
  className = "",
  interactive = true,
}: GeoTagMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    // Load Leaflet only on client side
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !L) {
        const leaflet = await import('leaflet');
        
        // Import CSS styles using CDN
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        cssLink.crossOrigin = '';
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          document.head.appendChild(cssLink);
        }
        
        // Fix for default markers
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
        
        setL(leaflet);
      }
    };
    
    loadLeaflet();
  }, []);

  useEffect(() => {
    if (L && mapContainerRef.current && mounted && !mapRef.current) {
      try {
        // Create map with unique ID to prevent conflicts
        const mapId = `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        mapContainerRef.current.id = mapId;
        
        const map = L.map(mapId).setView(center, zoom);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add click handler
        if (interactive && onPositionSelect) {
          map.on('click', (e: any) => {
            onPositionSelect([e.latlng.lat, e.latlng.lng]);
          });
        }

        // Add marker if position is selected
        if (selectedPosition) {
          L.marker(selectedPosition).addTo(map)
            .bindPopup(`Selected Location<br/>Lat: ${selectedPosition[0].toFixed(6)}<br/>Lng: ${selectedPosition[1].toFixed(6)}`);
        }

        // Add custom markers
        markers.forEach((marker) => {
          const leafletMarker = marker.icon 
            ? L.marker(marker.position, { icon: marker.icon })
            : L.marker(marker.position);
          
          leafletMarker.addTo(map).bindPopup(marker.popup);
        });

        mapRef.current = map;
      } catch (error) {
        console.error('Map initialization failed:', error);
      }
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
          mapRef.current = null;
        } catch (error) {
          console.warn('Map cleanup failed:', error);
        }
      }
    };
  }, [L, mounted, center, zoom, selectedPosition, onPositionSelect, interactive, markers]);

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
    <div className={`relative ${className}`} style={{ height }}>
      <div 
        ref={mapContainerRef}
        style={{ height: '100%', width: '100%' }}
      />
      
      {/* Instructions overlay for interactive maps */}
      {interactive && onPositionSelect && (
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 p-2 rounded-md shadow-md text-xs z-[1000]">
          Click on the map to select location
        </div>
      )}
    </div>
  );
}

// Export custom marker icons that can be created after Leaflet is loaded
export const createMarkerIcons = (L: any) => ({
  farmIcon: createCustomIcon(L, '#10b981'), // Green for farms
  processingIcon: createCustomIcon(L, '#3b82f6'), // Blue for processing
  qualityIcon: createCustomIcon(L, '#8b5cf6'), // Purple for quality
  shippingIcon: createCustomIcon(L, '#f59e0b'), // Orange for shipping
  deliveryIcon: createCustomIcon(L, '#ef4444'), // Red for delivery
});

// Legacy exports for backward compatibility (will be created dynamically)
export let farmIcon: any;
export let processingIcon: any;
export let qualityIcon: any;
export let shippingIcon: any;
export let deliveryIcon: any;

// Initialize icons when Leaflet is available
if (typeof window !== 'undefined') {
  import('leaflet').then((L) => {
    const icons = createMarkerIcons(L);
    farmIcon = icons.farmIcon;
    processingIcon = icons.processingIcon;
    qualityIcon = icons.qualityIcon;
    shippingIcon = icons.shippingIcon;
    deliveryIcon = icons.deliveryIcon;
  });
}
