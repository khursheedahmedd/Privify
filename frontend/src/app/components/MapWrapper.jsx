// components/MapWrapper.jsx
'use client';

import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const LocationMap = dynamic(
  () => import('./LocationMap'),
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
  }
);

export default function MapWrapper({ gpsData }) {
  return <LocationMap gpsData={gpsData} />;
}