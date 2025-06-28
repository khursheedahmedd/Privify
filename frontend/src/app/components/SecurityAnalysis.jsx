import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), { ssr: false });

export default function SecurityAnalysis({ metadata, analysis }) {
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (metadata?.GPSInfo) {
            // Convert to decimal coordinates
            const coords = convertGPSToDecimal(metadata.GPSInfo);
            setLocation(coords);
            
            // Reverse geocoding
            fetchAddress(coords).then(setAddress);
        }
    }, [metadata]);

    const fetchAddress = async (coords) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}`
            );
            const data = await response.json();
            return data.display_name || 'Location found';
        } catch (error) {
            return 'Could not resolve address';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-red-700 mb-2">
                    Security Summary: {analysis.overall_risk_level}
                </h3>
                <p className="text-red-600">{analysis.risk_summary}</p>
            </div>

            {location && (
                <div className="border p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Location Data</h4>
                    <p className="text-gray-600 mb-2">{address}</p>
                    <div className="h-64 rounded-lg overflow-hidden">
                        <Map lat={location.lat} lng={location.lon} />
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {analysis.risks.map((risk, idx) => (
                    <div key={idx} className={`p-4 rounded-lg ${
                        risk.severity === 'high' ? 'bg-red-50' : 
                        risk.severity === 'moderate' ? 'bg-orange-50' : 'bg-yellow-50'
                    }`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-medium">{risk.risk_type}</h4>
                                <p className="text-sm text-gray-600">{risk.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-sm ${
                                risk.severity === 'high' ? 'bg-red-100 text-red-800' :
                                risk.severity === 'moderate' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {risk.severity}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// GPS conversion helper
function convertGPSToDecimal(gps) {
    const parseCoord = (coord, ref) => {
        const decimal = coord[0] + coord[1]/60 + coord[2]/3600;
        return ref === 'S' || ref === 'W' ? -decimal : decimal;
    };
    
    return {
        lat: parseCoord(gps.GPSLatitude, gps.GPSLatitudeRef),
        lon: parseCoord(gps.GPSLongitude, gps.GPSLongitudeRef)
    };
}