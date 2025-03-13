export function convertGPSToDecimal(gpsData) {
  if (!gpsData) return null;

  const convert = (coord, ref) => {
    const degrees = coord[0];
    const minutes = coord[1];
    const seconds = coord[2];
    const decimal = degrees + (minutes / 60) + (seconds / 3600);
    return ['S', 'W'].includes(ref) ? -decimal : decimal;
  };

  try {
    return {
      lat: convert(gpsData.GPSLatitude, gpsData.GPSLatitudeRef),
      lng: convert(gpsData.GPSLongitude, gpsData.GPSLongitudeRef),
      mapUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}`
    };
  } catch (error) {
    console.error('GPS conversion error:', error);
    return null;
  }
}