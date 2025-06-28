import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
  iconUrl: '/images/leaflet/marker-icon.png',
  shadowUrl: '/images/leaflet/marker-shadow.png',
});


const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export default function LocationMap({ gpsData }) {
  const [position, setPosition] = useState(null);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && gpsData) {
      const convertGPSToDecimal = (coord, ref) => {
        const degrees = coord[0];
        const minutes = coord[1];
        const seconds = coord[2];
        const decimal = degrees + minutes / 60 + seconds / 3600;
        return ['S', 'W'].includes(ref) ? -decimal : decimal;
      };

      try {
        const lat = convertGPSToDecimal(gpsData.GPSLatitude, gpsData.GPSLatitudeRef);
        const lng = convertGPSToDecimal(gpsData.GPSLongitude, gpsData.GPSLongitudeRef);
        setPosition([lat, lng]);
        setMapKey(prev => prev + 1); // Force re-render on position change
      } catch (error) {
        console.error('Error converting GPS data:', error);
      }
    }
  }, [gpsData]);

  if (typeof window === 'undefined' || !position) return null;

  return (
    <div key={mapKey} className="h-64 w-full rounded-lg border-2 border-gray-100">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>Photo Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}