import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import { fetchMeta } from '../api';

// Fix for default Leaflet marker icons in React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Approximate coordinates for key Pune localities
const GEODATA = {
  // Dehu - Solapur Corridor
  'Dehu Road': [18.7167, 73.7667],
  'Kiwale': [18.6360, 73.7380],
  'Ravet': [18.6433, 73.7431],
  'Wakad': [18.5987, 73.7688],
  'Baner': [18.5590, 73.7868],
  'Hadapsar': [18.4967, 73.9417],
  'Manjri': [18.5135, 73.9780],
  'Loni Kalbhor': [18.4900, 74.0200],
  'Uruli Kanchan': [18.4950, 74.1350],
  
  // Kolhapur - Nashik Corridor
  'Khed Shivapur': [18.3490, 73.8340],
  'Sinhagad Road': [18.4830, 73.8300],
  'Hinjewadi': [18.5913, 73.7389],
  'Balewadi': [18.5760, 73.7788],
  'Chakan': [18.7500, 73.8667],
  'Bhosari': [18.6278, 73.8498],
  'Moshi': [18.6650, 73.8500],
  'Alandi': [18.6757, 73.8953],
};

const CORRIDOR_DATA = {
  dehu_solapur: { name: 'Dehu Road → Solapur Road', color: '#efab0f' },
  kolhapur_nashik: { name: 'Kolhapur Road → Nashik Road', color: '#10b981' }
};

export default function MapPage() {
  const [meta, setMeta] = useState(null);
  
  // Pune center coordinates
  const puneCenter = [18.5204, 73.8567];

  useEffect(() => {
    fetchMeta().then(setMeta).catch(console.error);
  }, []);

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-16rem)] min-h-[600px]">
      <div className="mb-4">
        <h2 className="section-title flex items-center gap-2">
          <MapPin className="w-6 h-6 text-brand-400" />
          Interactive Market Map
        </h2>
        <p className="section-subtitle">
          Explore Pune's growth corridors and localities.
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4">
        {Object.entries(CORRIDOR_DATA).map(([key, data]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: data.color }} />
            <span className="text-sm font-medium text-surface-300">{data.name}</span>
          </div>
        ))}
      </div>

      <div className="glass-card flex-1 p-2 relative overflow-hidden rounded-2xl">
        <MapContainer 
          center={puneCenter} 
          zoom={11} 
          style={{ height: '100%', width: '100%', borderRadius: '12px' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {meta && Object.entries(meta.localities).map(([corridor, locs]) => {
            return locs.map(loc => {
              const coords = GEODATA[loc];
              if (!coords) return null;
              
              // Custom marker logic can be highly specific (e.g., using divIcon to color by corridor)
              // But standard markers with descriptive popups work well to start.
              return (
                <Marker key={loc} position={coords}>
                  <Popup>
                    <div className="text-surface-900 min-w-[140px]">
                      <h3 className="font-bold text-sm mb-1">{loc}</h3>
                      <div className="text-xs mb-2">
                        <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: CORRIDOR_DATA[corridor].color }}></span>
                        {CORRIDOR_DATA[corridor].name}
                      </div>
                      <a href={`/?corridor=${corridor}&locality=${loc}`} className="text-brand-600 font-semibold text-xs hover:underline block">
                        Get Valuation →
                      </a>
                    </div>
                  </Popup>
                </Marker>
              );
            });
          })}
        </MapContainer>
      </div>
    </div>
  );
}
