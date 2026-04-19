import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Eye, Info, Users, Activity } from 'lucide-react';
import DensityBadge from '../components/DensityBadge';
import { useCrowd } from '../context/CrowdContext';

// Custom icons
const createIcon = (color) => new L.DivIcon({
  html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}"></div>`,
  className: '',
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});


const getZoneColor = (density) => {
  if (density < 0.4) return '#00ff88'; // Green
  if (density < 0.65) return '#eab308'; // Yellow
  if (density < 0.85) return '#ff8c00'; // Orange
  return '#ff3355'; // Red
};

// Determine radius for heat zones (in meters) based on type
const getZoneRadius = (type) => {
  switch(type) {
    case 'stand': return 60;
    case 'concourse': return 40;
    case 'gate': return 25;
    case 'parking': return 80;
    case 'food': 
    case 'merchandise': return 20;
    case 'restroom':
    case 'medical': return 15;
    default: return 30;
  }
};

// Component to handle map center updates
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 17);
  }, [center, map]);
  return null;
}

export default function CrowdMap() {
  const { state } = useCrowd();
  const [filter, setFilter] = useState('all');
  const [activeZone, setActiveZone] = useState(null);

  // Dynamic Center based on active venue selection
  const activeCenter = [state.activeVenue?.lat || 23.0918, state.activeVenue?.lng || 72.5973];
  
  // Calculate offset to dynamically shift the mock Narendra Modi zones to the selected venue
  const latOffset = activeCenter[0] - 23.0918;
  const lngOffset = activeCenter[1] - 72.5973;

  function generatePolygonCoords(zone) {
    if (zone.type === 'stand') {
      let startAngle = 0, endAngle = 0;
      if (zone.id.includes('north')) { startAngle = 315; endAngle = 405; }
      else if (zone.id.includes('east')) { startAngle = 45; endAngle = 135; }
      else if (zone.id.includes('south')) { startAngle = 135; endAngle = 225; }
      else if (zone.id.includes('west')) { startAngle = 225; endAngle = 315; }

      const coords = [];
      for (let a = startAngle; a <= endAngle; a += 5) {
        const rad = (a * Math.PI) / 180;
        coords.push([activeCenter[0] + Math.cos(rad) * 0.00130, activeCenter[1] + Math.sin(rad) * 0.00140]);
      }
      for (let a = endAngle; a >= startAngle; a -= 5) {
        const rad = (a * Math.PI) / 180;
        coords.push([activeCenter[0] + Math.cos(rad) * 0.00065, activeCenter[1] + Math.sin(rad) * 0.00075]);
      }
      return coords;
    }

    if (zone.type === 'concourse') {
      let startAngle = 0, endAngle = 0;
      if (zone.id.includes('n')) { startAngle = 270; endAngle = 450; }
      else { startAngle = 90; endAngle = 270; }

      const coords = [];
      for (let a = startAngle; a <= endAngle; a += 5) {
        const rad = (a * Math.PI) / 180;
        coords.push([activeCenter[0] + Math.cos(rad) * 0.00150, activeCenter[1] + Math.sin(rad) * 0.00160]);
      }
      for (let a = endAngle; a >= startAngle; a -= 5) {
        const rad = (a * Math.PI) / 180;
        coords.push([activeCenter[0] + Math.cos(rad) * 0.00130, activeCenter[1] + Math.sin(rad) * 0.00140]);
      }
      return coords;
    }

    return [];
  }

  const filteredZones = state.zones.filter(z => {
    if (filter === 'all') return true;
    if (filter === 'gates' && z.type === 'gate') return true;
    if (filter === 'stands' && z.type === 'stand') return true;
    if (filter === 'facilities' && !['gate', 'stand', 'concourse'].includes(z.type)) return true;
    return false;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] page-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Live Operations Map</h1>
          <p className="text-slate-400">Real-time geographical density tracking.</p>
        </div>
        
        <div className="flex p-1 bg-navy-800 rounded-lg border border-slate-700">
          {['all', 'gates', 'stands', 'facilities'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-2xl overflow-hidden relative border-slate-700 w-full min-h-[400px]">
        {/* Floating panel for zone details */}
        {activeZone && (
          <div className="absolute top-4 left-4 z-[400] w-72 glass-panel p-4 border-neon-cyan/30 shadow-2xl animate-fade-in pointer-events-auto">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-white">{activeZone.name}</h3>
              <DensityBadge status={activeZone.status} />
            </div>
            
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Capacity</span>
                  <span className="text-white">{activeZone.currentCount} / {activeZone.capacity}</span>
                </div>
                <div className="w-full h-2 bg-navy-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-1000" 
                    style={{ 
                      width: `${activeZone.occupancy}%`,
                      backgroundColor: getZoneColor(activeZone.density)
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10">
                <div className="bg-white/5 p-2 rounded-lg">
                  <p className="text-[10px] text-slate-400 uppercase">Trend</p>
                  <p className={`text-sm font-bold mt-1 ${activeZone.trend === 'up' ? 'text-neon-red' : 'text-neon-green'}`}>
                    {activeZone.trend === 'up' ? '↗ Rising' : '↘ Falling'}
                  </p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <p className="text-[10px] text-slate-400 uppercase">Type</p>
                  <p className="text-sm font-bold mt-1 text-white capitalize">{activeZone.type}</p>
                </div>
              </div>
            </div>
            <button 
              className="w-full mt-4 gradient-btn text-sm py-2"
              onClick={() => setActiveZone(null)}
            >
              Close Details
            </button>
          </div>
        )}

        {/* Leaflet Map */}
        <MapContainer 
          center={activeCenter} 
          zoom={18} 
          className="h-full w-full outline-none"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url="http://mt0.google.com/vt/lyrs=y,traffic&hl=en&x={x}&y={y}&z={z}"
            className="map-tiles-dark"
          />
          <MapUpdater center={activeCenter} />
          
          {filteredZones.map(zone => {
            const color = getZoneColor(zone.density);
            
            if (zone.type === 'stand' || zone.type === 'concourse') {
              const coords = generatePolygonCoords(zone);
              return (
                <Polygon 
                  key={zone.id}
                  positions={coords}
                  pathOptions={{ color: color, fillColor: color, fillOpacity: 0.45, weight: 2 }}
                  eventHandlers={{ click: () => setActiveZone(zone) }}
                  className="animate-fade-in"
                >
                  <Popup className="custom-popup">
                    <div className="text-center font-bold text-sm mb-1">{zone.name}</div>
                    <div className="text-center text-xs text-slate-400 capitalize">{zone.status} Density</div>
                  </Popup>
                </Polygon>
              );
            }

            const radius = getZoneRadius(zone.type);
            return (
              <Circle 
                key={zone.id}
                center={[zone.lat + latOffset, zone.lng + lngOffset]}
                radius={radius}
                pathOptions={{ color: color, fillColor: color, fillOpacity: 0.45, weight: 2 }}
                eventHandlers={{ click: () => setActiveZone(zone) }}
                className="animate-fade-in"
              >
                <Popup className="custom-popup">
                  <div className="text-center font-bold text-sm mb-1">{zone.name}</div>
                  <div className="text-center text-xs text-slate-400 capitalize">{zone.status} Density</div>
                </Popup>
              </Circle>
            )
          })}

          {/* Queues as markers */}
          {state.queues.map(q => (
            <Marker 
              key={q.id} 
              position={[q.lat + latOffset, q.lng + lngOffset]}
              icon={createIcon('#00d4ff')}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-bold">{q.name}</div>
                  <div className="text-sm text-neon-cyan mt-1">Wait: {q.currentWait} min</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
