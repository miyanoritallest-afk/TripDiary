'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PhotoPin } from '@/types';

// Leafletのデフォルトアイコン問題を修正
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

// 現在表示中の写真のピン（ハイライト用）
const activeIcon = new L.Icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [0, -49],
  shadowSize: [41, 41],
});

type Props = {
  photoPins: PhotoPin[];
  activePhotoIndex: number;
};

export default function PostMap({ photoPins, activePhotoIndex }: Props) {
  if (photoPins.length === 0) return null;

  // 地図の中心: アクティブなピン or 最初のピン
  const activePin = photoPins.find((p) => p.photoIndex === activePhotoIndex) ?? photoPins[0];
  const center: [number, number] = [activePin.lat, activePin.lng];

  return (
    <MapContainer
      key={`${center[0]}-${center[1]}`}
      center={center}
      zoom={13}
      style={{ width: '100%', height: '200px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {photoPins.map((pin) => (
        <Marker
          key={pin.photoIndex}
          position={[pin.lat, pin.lng]}
          icon={pin.photoIndex === activePhotoIndex ? activeIcon : new L.Icon.Default()}
        >
          <Popup>{pin.locationName}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
