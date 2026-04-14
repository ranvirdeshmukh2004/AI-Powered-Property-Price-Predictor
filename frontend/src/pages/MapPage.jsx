import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Layers } from 'lucide-react';
import L from 'leaflet';
import { fetchMeta } from '../api';

// Disable default icons globally
delete L.Icon.Default.prototype._getIconUrl;

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
  'Bhosari': [18.6278, 73.8498],
  'Moshi': [18.6650, 73.8500],
  'Alandi': [18.6757, 73.8953],
  'Chakan': [18.7500, 73.8667],
};

const CORRIDOR_DATA = {
  dehu_solapur: { name: 'Dehu Rd → Solapur Rd', color: '#efab0f' },
  kolhapur_nashik: { name: 'Kolhapur Rd → Nashik Rd', color: '#10b981' }
};

// Factory for Custom Glowing Markers using CSS
const createGlowingIcon = (color) => {
  return L.divIcon({
    className: 'custom-glowing-icon',
    html: `
      <div style="
        width: 16px; height: 16px; 
        background-color: ${color}; 
        border-radius: 50%; 
        border: 2px solid #1a1a1a;
        box-shadow: 0 0 10px ${color}, inset 0 0 5px rgba(255,255,255,0.8);
        transform: translate(-50%, -50%);
      "></div>
    `,
    iconSize: [0, 0],
  });
};

export default function MapPage() {
  const [meta, setMeta] = useState(null);
  const [activeCorridor, setActiveCorridor] = useState('all');
  
  // Pune center coordinates
  const puneCenter = [18.5804, 73.8567];

  useEffect(() => {
    fetchMeta().then(setMeta).catch(console.error);
  }, []);

  // Compute sequences for polylines based on ordered localities returned from metadata
  const routes = useMemo(() => {
    if (!meta) return {};
    const computed = {};
    Object.entries(meta.localities).forEach(([corridor, locs]) => {
      // Filter out mapped locations
      const pts = locs.map(loc => GEODATA[loc]).filter(Boolean);
      computed[corridor] = pts;
    });
    return computed;
  }, [meta]);

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-16rem)] min-h-[700px]">
      <div className="mb-4">
        <h2 className="section-title flex items-center gap-2">
          <MapPin className="w-6 h-6 text-brand-400" />
          Interactive Market Map
        </h2>
        <p className="section-subtitle">
          Industry-grade visualization of Pune's premium real estate growth corridors.
        </p>
      </div>

      {/* Corridor Toggle Control UI */}
      <div className="flex flex-wrap items-center gap-3 mb-4 p-3 glass-card rounded-2xl w-fit">
        <div className="flex items-center gap-2 mr-2 border-r border-surface-800 pr-4">
           <Layers className="w-4 h-4 text-surface-400" />
           <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Highlight Layers</span>
        </div>
        
        <button 
          onClick={() => setActiveCorridor('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCorridor === 'all' ? 'bg-surface-200 text-surface-900 shadow-md' : 'bg-surface-800/50 text-surface-300 hover:bg-surface-700'}`}
        >
          All Regions
        </button>
        
        {Object.entries(CORRIDOR_DATA).map(([key, data]) => (
          <button 
            key={key} 
            onClick={() => setActiveCorridor(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border`}
            style={{ 
              backgroundColor: activeCorridor === key ? data.color + '20' : 'transparent',
              borderColor: activeCorridor === key ? data.color : 'transparent',
              color: activeCorridor === key ? data.color : '#a3a3a3',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeCorridor === key ? data.color : '#a3a3a3' }}></span>
              {data.name}
            </div>
          </button>
        ))}
      </div>

      <div className="glass-card flex-1 p-1 relative overflow-hidden rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-surface-700">
        <MapContainer 
          center={puneCenter} 
          zoom={10} 
          style={{ height: '100%', width: '100%', borderRadius: '14px', backgroundColor: '#0f0f0f' }}
          className="z-0"
        >
          {/* DarkMatter Industry Grade Tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {meta && Object.entries(meta.localities).map(([corridor, locs]) => {
            // Apply filtering
            if (activeCorridor !== 'all' && activeCorridor !== corridor) return null;
            
            const color = CORRIDOR_DATA[corridor].color;
            const routePath = routes[corridor];

            return (
              <div key={corridor}>
                {/* Draw Corridor Path */}
                {routePath && routePath.length > 0 && (
                  <Polyline 
                    positions={routePath} 
                    pathOptions={{ color: color, weight: 4, opacity: 0.6, dashArray: '8, 8' }} 
                  />
                )}

                {/* Draw Markers */}
                {locs.map(loc => {
                  const coords = GEODATA[loc];
                  if (!coords) return null;
                  
                  return (
                    <Marker key={loc} position={coords} icon={createGlowingIcon(color)}>
                      <Popup className="glass-popup">
                        <div className="text-surface-900 min-w-[150px] p-1">
                          <h3 className="font-bold text-base mb-1">{loc}</h3>
                          <div className="text-xs mb-3 font-medium text-surface-600">
                            <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: color }}></span>
                            {CORRIDOR_DATA[corridor].name}
                          </div>
                          <a href={`/?corridor=${corridor}&locality=${loc}`} 
                             className="inline-block w-full text-center py-2 bg-brand-500 text-brand-950 font-bold text-xs rounded-md hover:bg-brand-400 transition-colors">
                            Predict Pricing →
                          </a>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </div>
            );
          })}
        </MapContainer>

        {/* Global CSS for Custom Popups so it matches the theme */}
        <style dangerouslySetInnerHTML={{ __html: `
          .glass-popup .leaflet-popup-content-wrapper {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.2);
          }
          .glass-popup .leaflet-popup-tip {
            background: rgba(255, 255, 255, 0.95);
          }
          .custom-glowing-icon {
            pointer-events: auto !important;
          }
        `}} />
      </div>
    </div>
  );
}
