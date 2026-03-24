// PlatformMap — web implementation using Leaflet

import React, { useEffect, useRef } from 'react';
import { PlatformMapProps, ZONE_COLOURS } from './PlatformMap.types';

// Leaflet CSS injected once
function useLeafletCSS() {
  useEffect(() => {
    const id = 'leaflet-css';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
    document.head.appendChild(link);
  }, []);
}

export default function PlatformMap({ zones, userPos, pendingPoint, pendingRadius, onMapPress }: PlatformMapProps) {
  useLeafletCSS();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const zoneLayersRef = useRef<Map<number, { marker: any; circle: any }>>(new Map());
  const pendingMarkerRef = useRef<any>(null);
  const pendingCircleRef = useRef<any>(null);

  // Initialise Leaflet map
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = await import('leaflet');
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (cancelled || !mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current).setView([44.4268, 26.1025], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      map.on('click', (e: any) => {
        onMapPress({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      mapRef.current = map;

      // Centre on user if geolocation available
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 14),
          () => {},
          { enableHighAccuracy: true },
        );
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Draw saved zones
  useEffect(() => {
    if (!mapRef.current) return;
    (async () => {
      const L = await import('leaflet');
      const map = mapRef.current;

      zoneLayersRef.current.forEach(({ marker, circle }) => {
        map.removeLayer(marker);
        map.removeLayer(circle);
      });
      zoneLayersRef.current.clear();

      zones.forEach((z, i) => {
        const colour = ZONE_COLOURS[i % ZONE_COLOURS.length];
        const marker = L.marker([z.latitude, z.longitude])
          .addTo(map)
          .bindPopup(`<b>${z.name}</b><br>${z.radius_meters}m radius`);
        const circle = L.circle([z.latitude, z.longitude], {
          radius: z.radius_meters,
          color: colour,
          fillColor: colour,
          fillOpacity: 0.12,
        }).addTo(map);
        zoneLayersRef.current.set(z.id, { marker, circle });
      });
    })();
  }, [zones]);

  // Draw pending point
  useEffect(() => {
    if (!mapRef.current) return;
    (async () => {
      const L = await import('leaflet');
      const map = mapRef.current;

      if (pendingMarkerRef.current) map.removeLayer(pendingMarkerRef.current);
      if (pendingCircleRef.current) map.removeLayer(pendingCircleRef.current);
      pendingMarkerRef.current = null;
      pendingCircleRef.current = null;

      if (!pendingPoint) return;

      const pendingIcon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      pendingMarkerRef.current = L.marker([pendingPoint.lat, pendingPoint.lng], { icon: pendingIcon, opacity: 0.6 })
        .addTo(map)
        .bindPopup('New zone (unsaved)');

      pendingCircleRef.current = L.circle([pendingPoint.lat, pendingPoint.lng], {
        radius: pendingRadius,
        color: '#9ca3af',
        dashArray: '6',
        fillColor: '#9ca3af',
        fillOpacity: 0.08,
      }).addTo(map);
    })();
  }, [pendingPoint, pendingRadius]);

  // Draw user position marker
  useEffect(() => {
    if (!mapRef.current || !userPos) return;
    (async () => {
      const L = await import('leaflet');
      const map = mapRef.current;

      if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);

      const userIcon = L.divIcon({
        html: '<div style="background:#22c55e;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.3)"></div>',
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      userMarkerRef.current = L.marker([userPos.lat, userPos.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('You are here');
    })();
  }, [userPos]);

  return <div ref={mapContainerRef} style={{ flex: 1, minHeight: 0 }} />;
}
