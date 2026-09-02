import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SiteLocation, Equipment } from '../../types';
import { ExternalLink, Navigation, Layers } from 'lucide-react';

// Fix default leaflet marker icon issue in Vite React
const createCatIcon = (color = '#FFCD11') => {
  const svgHtml = `
    <div style="
      background-color: #11141A;
      border: 2px solid ${color};
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 14px ${color};
      cursor: pointer;
    ">
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 12px solid ${color};
      "></div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'cat-custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

const createMachineIcon = (status: string) => {
  const color = status === 'Rented' ? '#10B981' : status === 'Idle' ? '#F59E0B' : '#60A5FA';
  const svgHtml = `
    <div style="
      background-color: #0A0C0F;
      border: 1.5px solid ${color};
      border-radius: 4px;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 6px ${color};
    ">
      <div style="width: 6px; height: 6px; border-radius: 50%; background: ${color};"></div>
    </div>
  `;
  return L.divIcon({
    html: svgHtml,
    className: 'machine-custom-marker',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10]
  });
};

// Component to dynamically re-center map whenever site changes
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13, { animate: true });
  }, [lat, lng, map]);
  return null;
}

interface DynamicSiteMapProps {
  site: SiteLocation;
  assignedEquipment?: Equipment[];
  height?: string;
  showGoogleMapsButton?: boolean;
}

export const DynamicSiteMap: React.FC<DynamicSiteMapProps> = ({
  site,
  assignedEquipment = [],
  height = '340px',
  showGoogleMapsButton = true
}) => {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${site.latitude},${site.longitude}`;

  // Deterministically spread machine markers slightly around site coordinates
  const machineLocations = assignedEquipment.slice(0, 12).map((eq, i) => {
    const angle = (i / 12) * 2 * Math.PI;
    const radius = 0.003 + (i % 3) * 0.0015;
    return {
      equipment: eq,
      lat: site.latitude + Math.sin(angle) * radius,
      lng: site.longitude + Math.cos(angle) * radius
    };
  });

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--cat-border)' }}>
      {/* Map Control Overlay Header */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          backgroundColor: 'rgba(17, 20, 26, 0.88)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--cat-border)',
          borderRadius: '6px',
          padding: '0.4rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--cat-text-primary)'
        }}
      >
        <Navigation size={13} color="#FFCD11" />
        <span style={{ fontWeight: 600 }}>{site.name}</span>
        <span style={{ color: 'var(--cat-text-muted)' }}>|</span>
        <span className="font-mono" style={{ color: '#FFCD11', fontSize: '0.7rem' }}>
          {site.latitude.toFixed(4)}°, {site.longitude.toFixed(4)}°
        </span>
      </div>

      {showGoogleMapsButton && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            backgroundColor: '#FFCD11',
            color: '#000000',
            fontWeight: 700,
            fontSize: '0.75rem',
            padding: '0.35rem 0.65rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
          }}
        >
          <span>Open in Google Maps</span>
          <ExternalLink size={12} />
        </a>
      )}

      {/* Map Container */}
      <MapContainer
        center={[site.latitude, site.longitude]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Dark Matter Carto Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        <MapRecenter lat={site.latitude} lng={site.longitude} />

        {/* Site Boundary Radius */}
        <Circle
          center={[site.latitude, site.longitude]}
          radius={1200}
          pathOptions={{
            color: '#FFCD11',
            fillColor: '#FFCD11',
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '4, 4'
          }}
        />

        {/* Primary Site Hub Marker */}
        <Marker position={[site.latitude, site.longitude]} icon={createCatIcon('#FFCD11')}>
          <Popup>
            <div style={{ padding: '4px', maxWidth: '200px' }}>
              <div style={{ color: '#FFCD11', fontWeight: 700, fontSize: '0.875rem', marginBottom: '2px' }}>
                {site.name}
              </div>
              <div style={{ color: '#9CA3AF', fontSize: '0.75rem', marginBottom: '6px' }}>
                {site.location} ({site.category})
              </div>
              <div style={{ fontSize: '0.7rem', borderTop: '1px solid #262E3B', paddingTop: '4px' }}>
                <strong>Active Fleet:</strong> {assignedEquipment.length} units
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Assigned Machine Markers */}
        {machineLocations.map((m, idx) => (
          <Marker
            key={`m-${idx}`}
            position={[m.lat, m.lng]}
            icon={createMachineIcon(m.equipment.status)}
          >
            <Popup>
              <div style={{ padding: '3px', fontSize: '0.75rem' }}>
                <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{m.equipment.id}</div>
                <div style={{ color: '#FFCD11' }}>{m.equipment.type} ({m.equipment.model})</div>
                <div>Status: <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{m.equipment.status}</span></div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          zIndex: 1000,
          backgroundColor: 'rgba(17, 20, 26, 0.85)',
          backdropFilter: 'blur(6px)',
          border: '1px solid var(--cat-border)',
          borderRadius: '4px',
          padding: '0.3rem 0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.65rem',
          color: 'var(--cat-text-secondary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFCD11', display: 'inline-block' }}></span>
          <span>Site Center</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '2px', backgroundColor: '#10B981', display: 'inline-block' }}></span>
          <span>Active</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '2px', backgroundColor: '#F59E0B', display: 'inline-block' }}></span>
          <span>Idle</span>
        </div>
      </div>
    </div>
  );
};
