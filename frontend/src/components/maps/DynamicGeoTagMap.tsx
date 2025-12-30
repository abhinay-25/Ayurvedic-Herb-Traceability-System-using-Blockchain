"use client";

import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with Leaflet
const GeoTagMap = dynamic(
  () => import('./GeoTagMap').then((mod) => ({ default: mod.GeoTagMap })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-100 rounded-md flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
);

export default GeoTagMap;