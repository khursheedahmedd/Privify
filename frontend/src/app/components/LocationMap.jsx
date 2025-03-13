import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

// Configure Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMap = ({ gpsData }) => {
    const [position, setPosition] = useState(null);

    useEffect(() => {
        if (gpsData) {
            // Convert DMS (degrees, minutes, seconds) to decimal degrees
            const convertDMSToDecimal = (degrees, minutes, seconds, direction) => {
                let decimal = degrees + minutes / 60 + seconds / 3600;
                if (direction === 'S' || direction === 'W') {
                    decimal = -decimal;
                }
                return decimal;
            };

            try {
                const lat = convertDMSToDecimal(
                    gpsData.GPSLatitude[0],
                    gpsData.GPSLatitude[1],
                    gpsData.GPSLatitude[2],
                    gpsData.GPSLatitudeRef
                );

                const lng = convertDMSToDecimal(
                    gpsData.GPSLongitude[0],
                    gpsData.GPSLongitude[1],
                    gpsData.GPSLongitude[2],
                    gpsData.GPSLongitudeRef
                );

                setPosition([lat, lng]);
            } catch (error) {
                console.error('Error converting GPS data:', error);
            }
        }
    }, [gpsData]);

    if (!position) return null;

    return (
        <div className="h-96 w-full rounded-lg border-2 border-gray-200 shadow-lg">
            <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                className="rounded-lg"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup className="leaflet-popup-content-wrapper">
                        <div className="text-center p-2">
                            <h3 className="font-bold text-lg mb-2">Photo Location</h3>
                            <p className="text-sm">
                                Latitude: {position[0].toFixed(6)}°<br />
                                Longitude: {position[1].toFixed(6)}°
                            </p>
                            <a
                                href={`https://www.openstreetmap.org/?mlat=${position[0]}&mlon=${position[1]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline mt-2 inline-block"
                            >
                                View on OpenStreetMap
                            </a>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

// Wrap in dynamic import for Next.js
export default dynamic(
    () => Promise.resolve(LocationMap),
    { 
        ssr: false,
        loading: () => <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
    }
);