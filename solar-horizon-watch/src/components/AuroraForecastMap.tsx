import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  Popup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon paths (Leaflet expects images in /)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface AuroraPoint {
  lat: number;
  lon: number;
  probability: number; // 0-100
}

const fetchAuroraData = async (): Promise<AuroraPoint[]> => {
  try {
    // NOAA OVATION real-time aurora (approx every 5 minutes)
    const res = await fetch(
      'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json'
    );
    if (!res.ok) throw new Error('Aurora data fetch failed');
    const json = await res.json();
    // json.points: [lat, lon, prob]
    return (json.points as number[][]).map((p) => ({
      lat: p[0],
      lon: p[1] > 180 ? p[1] - 360 : p[1], // adjust lon to -180..180
      probability: p[2],
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
};

const colorScale = (prob: number) => {
  // 0–5: transparent, 5–100 gradient green->purple
  if (prob < 5) return 'rgba(0,0,0,0)';
  const pct = Math.min(Math.max(prob, 5), 100) / 100;
  const r = Math.round(50 + 205 * pct); // 50→255
  const g = Math.round(220 - 220 * pct); // 220→0
  const b = Math.round(100 + 155 * pct); // 100→255
  return `rgba(${r},${g},${b},0.6)`;
};

const AuroraForecastMap: React.FC = () => {
  const [auroraData, setAuroraData] = useState<AuroraPoint[]>([]);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Get aurora data once on mount; could add polling later
    fetchAuroraData().then(setAuroraData);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        () => null
      );
    }
  }, []);

  // Determine initial center
  const center: [number, number] = userPos ?? [65, 0];

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden aetheria-glass">
      <MapContainer center={center} zoom={3} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {auroraData.map((pt, idx) => (
          <CircleMarker
            key={idx}
            center={[pt.lat, pt.lon]}
            radius={Math.max(2, (pt.probability / 100) * 10)}
            color={colorScale(pt.probability)}
            fillOpacity={0.6}
            stroke={false}
          >
            {pt.probability > 10 && (
              <Popup>
                Lat {pt.lat.toFixed(1)}°, Lon {pt.lon.toFixed(1)}°
                <br />Probability: {pt.probability}%
              </Popup>
            )}
          </CircleMarker>
        ))}
        {userPos && (
          <Marker position={userPos}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default AuroraForecastMap;
