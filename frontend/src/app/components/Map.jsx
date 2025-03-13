import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ lat, lng }) {
    return (
        <MapContainer
            center={[lat, lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            attributionControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
                <Popup>
                    Image Location
                </Popup>
            </Marker>
        </MapContainer>
    );
}