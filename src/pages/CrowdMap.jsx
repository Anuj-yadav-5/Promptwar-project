import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, AlertTriangle, CheckCircle2, Info, Users } from 'lucide-react';
import DensityBadge from '../components/DensityBadge';
import { useCrowd } from '../context/CrowdContext';

// ── Helpers (stable — defined outside component) ─────────────────────────────
const getZoneColor = (density) => {
  if (density < 0.40) return '#00ff88';
  if (density < 0.65) return '#eab308';
  if (density < 0.85) return '#ff8c00';
  return '#ff3355';
};

const ZONE_META = {
  gate:        { emoji: '🚧', shortName: z => `Gate ${z.name.match(/[A-D]/)?.[0] || ''}` },
  food:        { emoji: '🍔', shortName: () => 'Food'    },
  drinks:      { emoji: '🥤', shortName: () => 'Drinks'  },
  restroom:    { emoji: '🚻', shortName: () => 'WC'      },
  merchandise: { emoji: '🛍️', shortName: () => 'Shop'    },
  medical:     { emoji: '⛑️', shortName: () => 'Medical' },
  vip:         { emoji: '⭐', shortName: () => 'VIP'     },
  parking:     { emoji: '🅿️', shortName: () => 'Parking' },
};

function makeZoneIcon(zone) {
  const meta  = ZONE_META[zone.type] || { emoji: '📍', shortName: z => z.name.split(' ')[0] };
  const color = getZoneColor(zone.density);
  const label = meta.shortName(zone);
  return new L.DivIcon({
    html: `<div style="display:flex;align-items:center;gap:4px;background:rgba(10,14,39,0.9);border:1.5px solid ${color};border-radius:20px;padding:3px 9px;white-space:nowrap;box-shadow:0 0 10px ${color}55;font-size:11px;font-weight:700;color:white;font-family:Inter,sans-serif;cursor:pointer">
      <span style="line-height:1">${meta.emoji}</span><span style="color:${color}">${label}</span>
    </div>`,
    className: '',
    iconSize: null,
    iconAnchor: [0, 10],
  });
}

function makeQueueIcon(q) {
  return new L.DivIcon({
    html: `<div style="display:flex;align-items:center;gap:3px;background:rgba(0,212,255,0.12);border:1.5px solid #00d4ff;border-radius:20px;padding:2px 7px;font-size:10px;font-weight:700;color:#00d4ff;font-family:Inter,sans-serif;white-space:nowrap;box-shadow:0 0 8px rgba(0,212,255,0.35)">
      ⏱ ${q.currentWait}m
    </div>`,
    className: '',
    iconSize: null,
    iconAnchor: [0, 10],
  });
}

// Proportional offsets [dLat, dLng] from stadium centre (relative system, scaled by S)
const BASE_ZONE_POS = {
  'gate-a':       [ 0.0021,  0.0000], 'gate-b':    [ 0.0000,  0.0022],
  'gate-c':       [-0.0021,  0.0000], 'gate-d':    [ 0.0000, -0.0022],
  'stand-north':  [ 0.0012,  0.0000], 'stand-east':[ 0.0000,  0.0014],
  'stand-south':  [-0.0012,  0.0000], 'stand-west':[ 0.0000, -0.0014],
  'concourse-n':  [ 0.0017,  0.0000], 'concourse-s':[-0.0017, 0.0000],
  'food-court-1': [ 0.0011, -0.0013], 'food-court-2':[-0.0007, 0.0011],
  'restroom-n':   [ 0.0016, -0.0008], 'restroom-s':[-0.0011,  0.0009],
  'merch-store':  [ 0.0008, -0.0015], 'medical':   [-0.0004, -0.0015],
  'vip-lounge':   [ 0.0000, -0.0018], 'parking-a': [ 0.0023, -0.0018],
};
const BASE_QUEUE_POS = {
  'q-food-1':    [ 0.0012,-0.0011], 'q-food-2':    [ 0.0010,-0.0013],
  'q-food-3':    [-0.0006, 0.0011], 'q-drink-1':   [ 0.0013,-0.0010],
  'q-drink-2':   [-0.0008, 0.0010], 'q-restroom-1':[ 0.0016,-0.0007],
  'q-restroom-2':[-0.0011, 0.0008], 'q-merch-1':   [ 0.0009,-0.0014],
  'q-entry-a':   [ 0.0021, 0.0002], 'q-entry-c':   [-0.0021, 0.0002],
};

// MapUpdater — re-centres map when venue changes
function MapUpdater({ center, mapRef }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 17, { animate: true, duration: 0.8 });
    if (mapRef) mapRef.current = map;
  }, [center[0], center[1]]);                  // only fire when coords change
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CrowdMap() {
  const { state }                   = useCrowd();
  const [filter, setFilter]         = useState('all');
  const [activeZone, setActiveZone] = useState(null);
  const mapRef                      = useRef(null);

  // ── Stable derived values (recalculated only when venue or zones change) ───
  const activeCenter = useMemo(() =>
    [state.activeVenue?.lat || 23.0917, state.activeVenue?.lng || 72.5971],
    [state.activeVenue?.lat, state.activeVenue?.lng]
  );

  const S = useMemo(() => {
    const cap = parseInt((state.activeVenue?.capacity || '132,000').replace(/,/g, ''));
    return Math.min(1.0, Math.max(0.45, Math.sqrt(cap / 132000)));
  }, [state.activeVenue?.capacity]);

  const getPos = useCallback((id, base) => {
    const [dlat, dlng] = base[id] || [0, 0];
    return [activeCenter[0] + dlat * S, activeCenter[1] + dlng * S];
  }, [activeCenter, S]);

  // ── Live status counts for the stats bar ──────────────────────────────────
  const statusCounts = useMemo(() => {
    const counts = { critical: 0, high: 0, moderate: 0, low: 0 };
    state.zones.forEach(z => { if (counts[z.status] !== undefined) counts[z.status]++; });
    return counts;
  }, [state.zones]);

  // ── Arc polygon builder ───────────────────────────────────────────────────
  const buildArc = useCallback((zone) => {
    let startAngle, endAngle, outerLat, outerLng, innerLat, innerLng;
    if (zone.type === 'stand') {
      outerLat = 0.00130 * S; outerLng = 0.00140 * S;
      innerLat = 0.00065 * S; innerLng = 0.00075 * S;
      if      (zone.id.includes('north')) { startAngle = 315; endAngle = 405; }
      else if (zone.id.includes('east'))  { startAngle = 45;  endAngle = 135; }
      else if (zone.id.includes('south')) { startAngle = 135; endAngle = 225; }
      else                                { startAngle = 225; endAngle = 315; }
    } else {
      outerLat = 0.00150 * S; outerLng = 0.00160 * S;
      innerLat = 0.00132 * S; innerLng = 0.00142 * S;
      startAngle = zone.id.includes('n') ? 270 : 90;
      endAngle   = zone.id.includes('n') ? 450 : 270;
    }
    const coords = [];
    for (let a = startAngle; a <= endAngle; a += 5) {
      const r = (a * Math.PI) / 180;
      coords.push([activeCenter[0] + Math.cos(r) * outerLat, activeCenter[1] + Math.sin(r) * outerLng]);
    }
    for (let a = endAngle; a >= startAngle; a -= 5) {
      const r = (a * Math.PI) / 180;
      coords.push([activeCenter[0] + Math.cos(r) * innerLat, activeCenter[1] + Math.sin(r) * innerLng]);
    }
    return coords;
  }, [activeCenter, S]);

  // ── Filtered zones ────────────────────────────────────────────────────────
  const filteredZones = useMemo(() => state.zones.filter(z => {
    if (filter === 'all')        return true;
    if (filter === 'gates')      return z.type === 'gate';
    if (filter === 'stands')     return z.type === 'stand';
    if (filter === 'facilities') return !['gate','stand','concourse'].includes(z.type);
    return false;
  }), [state.zones, filter]);

  const filterCounts = useMemo(() => ({
    all:        state.zones.length,
    gates:      state.zones.filter(z => z.type === 'gate').length,
    stands:     state.zones.filter(z => z.type === 'stand').length,
    facilities: state.zones.filter(z => !['gate','stand','concourse'].includes(z.type)).length,
  }), [state.zones]);

  const handleRecenter = useCallback(() => {
    if (mapRef.current) mapRef.current.setView(activeCenter, 17, { animate: true });
  }, [activeCenter]);

  const handleZoneClick = useCallback((zone) => setActiveZone(zone), []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] page-enter gap-3">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Live Operations Map</h1>
          <p className="text-slate-400 text-sm">{state.activeVenue?.name}</p>
        </div>

        {/* Filter tabs with counts */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-navy-800 rounded-lg border border-slate-700">
            {['all','gates','stands','facilities'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all flex items-center gap-1.5 ${
                  filter === f ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30' : 'text-slate-400 hover:text-white'
                }`}>
                {f}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-neon-cyan/30' : 'bg-slate-700'}`}>
                  {filterCounts[f]}
                </span>
              </button>
            ))}
          </div>
          {/* Recenter button */}
          <button onClick={handleRecenter}
            title="Centre on stadium"
            className="p-2 bg-navy-800 border border-slate-700 rounded-lg text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/40 transition-all">
            <Crosshair size={16} />
          </button>
        </div>
      </div>

      {/* ── Live status stats bar ── */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
        {[
          { key: 'critical', color: '#ff3355', icon: AlertTriangle, label: 'Critical' },
          { key: 'high',     color: '#ff8c00', icon: AlertTriangle, label: 'High'     },
          { key: 'moderate', color: '#eab308', icon: Info,          label: 'Moderate' },
          { key: 'low',      color: '#00ff88', icon: CheckCircle2,  label: 'Clear'    },
        ].map(({ key, color, icon: Icon, label }, i) => (
          <div key={key} className="glass-panel-hover rounded-xl px-3 py-2 flex items-center gap-2 border-0 animate-slide-up"
            style={{ borderLeft: `3px solid ${color}`, animationDelay: `${i * 100}ms` }}>
            <Icon size={14} style={{ color }} />
            <div>
              <p className="text-[10px] text-slate-400">{label}</p>
              <p className="text-base font-bold text-white leading-tight">{statusCounts[key]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Map container ── */}
      <div className="flex-1 glass-panel rounded-2xl overflow-hidden relative w-full min-h-[300px]">

        {/* Zone detail floating panel */}
        {activeZone && (
          <div className="absolute top-3 left-3 z-[400] w-64 glass-panel-hover p-4 border-neon-cyan/30 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-white text-sm leading-tight pr-2">{activeZone.name}</h3>
              <DensityBadge status={activeZone.status} />
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Occupancy</span>
                <span className="text-white font-semibold">{activeZone.occupancy}%</span>
              </div>
              <div className="w-full h-1.5 bg-navy-900 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${activeZone.occupancy}%`, backgroundColor: getZoneColor(activeZone.density) }} />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{activeZone.currentCount?.toLocaleString()} / {activeZone.capacity?.toLocaleString()} people</p>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-white/5 rounded-lg p-2 text-center">
                <p className="text-[9px] text-slate-400 uppercase mb-0.5">Trend</p>
                <p className={`text-xs font-bold ${activeZone.trend === 'up' ? 'text-red-400' : 'text-green-400'}`}>
                  {activeZone.trend === 'up' ? '↗ Rising' : '↘ Falling'}
                </p>
              </div>
              <div className="flex-1 bg-white/5 rounded-lg p-2 text-center">
                <p className="text-[9px] text-slate-400 uppercase mb-0.5">Type</p>
                <p className="text-xs font-bold text-white capitalize">{activeZone.type}</p>
              </div>
            </div>
            <button className="w-full mt-3 text-xs text-slate-400 hover:text-white transition-colors py-1.5 border border-slate-700 rounded-lg"
              onClick={() => setActiveZone(null)}>
              Dismiss ✕
            </button>
          </div>
        )}

        {/* Density legend */}
        <div className="absolute bottom-3 right-3 z-[400] glass-panel-hover p-2.5 rounded-xl text-xs space-y-1.5 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <p className="text-slate-500 font-semibold text-[9px] uppercase tracking-wider">Density</p>
          {[['#00ff88','Low'],['#eab308','Moderate'],['#ff8c00','High'],['#ff3355','Critical']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c, boxShadow: `0 0 5px ${c}` }} />
              <span className="text-slate-300">{l}</span>
            </div>
          ))}
        </div>

        {/* Leaflet map */}
        <MapContainer center={activeCenter} zoom={17} className="h-full w-full outline-none" zoomControl={true}>
          <TileLayer
            attribution='&copy; Google Maps'
            url="http://mt0.google.com/vt/lyrs=y,traffic&hl=en&x={x}&y={y}&z={z}"
          />
          <MapUpdater center={activeCenter} mapRef={mapRef} />

          {/* Stadium boundary ring */}
          <Circle center={activeCenter} radius={160 * S}
            pathOptions={{ color:'#00d4ff', fillColor:'#00d4ff', fillOpacity:0.04, weight:2, dashArray:'6,10' }} />

          {/* Pitch oval */}
          <Circle center={activeCenter} radius={55 * S}
            pathOptions={{ color:'#00ff88', fillColor:'#00ff88', fillOpacity:0.10, weight:1.5, dashArray:'4,8' }} />

          {/* Stand & Concourse arc polygons */}
          {filteredZones
            .filter(z => z.type === 'stand' || z.type === 'concourse')
            .map(zone => (
              <Polygon key={zone.id} positions={buildArc(zone)}
                pathOptions={{ color: getZoneColor(zone.density), fillColor: getZoneColor(zone.density), fillOpacity: 0.4, weight: 2 }}
                eventHandlers={{ click: () => handleZoneClick(zone) }}>
                <Popup className="custom-popup">
                  <div className="text-center font-bold text-sm">{zone.name}</div>
                  <div className="text-center text-xs text-slate-400 mt-1">{zone.occupancy}% · {zone.status}</div>
                </Popup>
              </Polygon>
            ))}

          {/* Zone badge markers (gates, facilities, parking) */}
          {filteredZones
            .filter(z => z.type !== 'stand' && z.type !== 'concourse')
            .map(zone => (
              <Marker key={zone.id}
                position={getPos(zone.id, BASE_ZONE_POS)}
                icon={makeZoneIcon(zone)}
                eventHandlers={{ click: () => handleZoneClick(zone) }}>
                <Popup className="custom-popup">
                  <div className="text-center font-bold text-sm">{zone.name}</div>
                  <div className="text-center text-xs text-slate-400 mt-1">{zone.occupancy}% full · {zone.status}</div>
                </Popup>
              </Marker>
            ))}

          {/* Queue wait-time markers */}
          {state.queues.map(q => (
            <Marker key={q.id} position={getPos(q.id, BASE_QUEUE_POS)} icon={makeQueueIcon(q)}>
              <Popup>
                <div className="text-center">
                  <div className="font-bold text-sm">{q.name}</div>
                  <div className="text-neon-cyan mt-1 text-sm">⏱ {q.currentWait} min wait</div>
                  <div className="text-slate-400 text-xs mt-0.5">~{q.queueLength} people in queue</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
