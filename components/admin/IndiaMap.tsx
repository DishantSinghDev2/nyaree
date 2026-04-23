"use client";
// components/admin/IndiaMap.tsx
// India map using @vnedyalk0v/react19-simple-maps (React 19 + TypeScript-first fork)
// Docs: https://github.com/vnedyalk0v/react19-simple-maps
import { useState, useCallback, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
  createCoordinates,
  createZoomConfig,
} from "@vnedyalk0v/react19-simple-maps";
import type { Coordinates } from "@vnedyalk0v/react19-simple-maps";

// India states TopoJSON — reliable public CDN
const INDIA_TOPO_URL =
  "https://raw.githubusercontent.com/udit-001/india-maps-data/master/topojson/india.json";

// Major Indian city coordinates [lng, lat]
const CITY_COORDS: Record<string, Coordinates> = {
  delhi:       createCoordinates(77.2090, 28.6139),
  "new delhi": createCoordinates(77.2090, 28.6139),
  mumbai:      createCoordinates(72.8777, 19.0760),
  bangalore:   createCoordinates(77.5946, 12.9716),
  bengaluru:   createCoordinates(77.5946, 12.9716),
  hyderabad:   createCoordinates(78.4867, 17.3850),
  chennai:     createCoordinates(80.2707, 13.0827),
  kolkata:     createCoordinates(88.3639, 22.5726),
  pune:        createCoordinates(73.8567, 18.5204),
  ahmedabad:   createCoordinates(72.5714, 23.0225),
  jaipur:      createCoordinates(75.7873, 26.9124),
  lucknow:     createCoordinates(80.9462, 26.8467),
  chandigarh:  createCoordinates(76.7794, 30.7333),
  bahadurgarh: createCoordinates(76.9267, 28.6877),
  surat:       createCoordinates(72.8311, 21.1702),
  indore:      createCoordinates(75.8577, 22.7196),
  bhopal:      createCoordinates(77.4126, 23.2599),
  nagpur:      createCoordinates(79.0882, 21.1458),
  patna:       createCoordinates(85.1376, 25.5941),
  vadodara:    createCoordinates(73.1812, 22.3072),
  coimbatore:  createCoordinates(76.9558, 11.0168),
  kochi:       createCoordinates(76.2673,  9.9312),
  gurgaon:     createCoordinates(77.0266, 28.4595),
  noida:       createCoordinates(77.3910, 28.5355),
  faridabad:   createCoordinates(77.3178, 28.4089),
  visakhapatnam: createCoordinates(83.2185, 17.6868),
  agra:        createCoordinates(78.0081, 27.1767),
  varanasi:    createCoordinates(82.9739, 25.3176),
};

const CITY_KEYS = Object.keys(CITY_COORDS);

/** Deterministic city for a session (until real IP-geo is wired in) */
function sessionToCoords(sessionId: string): Coordinates | null {
  const hash = sessionId
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const key = CITY_KEYS[hash % CITY_KEYS.length];
  return key ? CITY_COORDS[key] : null;
}

function getUserCoords(user: ActiveUser): Coordinates | null {
  if (user.city) {
    const c = CITY_COORDS[user.city.toLowerCase()];
    if (c) return c;
  }
  return sessionToCoords(user.sessionId);
}

export interface ActiveUser {
  sessionId: string;
  path: string;
  device: string;
  country: string;
  ip: string;
  timestamp: string;
  city?: string;
}

interface Tooltip {
  text: string;
  x: number;
  y: number;
}

interface Props {
  activeUsers: ActiveUser[];
}

// Map centre [lng, lat] for India
const INDIA_CENTER = createCoordinates(82, 22);
const ZOOM_CFG = createZoomConfig(1, 8); // min=1, max=8

export const IndiaMap = memo(function IndiaMap({ activeUsers }: Props) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<Coordinates>(INDIA_CENTER);

  // ZoomableGroup: onMoveEnd gives { coordinates, zoom }
  const handleMoveEnd = useCallback(
    ({ coordinates, zoom: z }: { coordinates: Coordinates; zoom: number }) => {
      setCenter(coordinates);
      setZoom(z);
    },
    []
  );

  const clearTooltip = useCallback(() => setTooltip(null), []);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 540, margin: "0 auto" }}>
      {/* Online badge */}
      {activeUsers.length > 0 && (
        <div style={{
          position: "absolute", top: 10, right: 10, zIndex: 10,
          background: "rgba(34,197,94,0.15)", border: "1px solid #22C55E",
          borderRadius: "var(--radius-pill)", padding: "3px 11px",
          fontSize: 12, color: "#16A34A", fontWeight: 600,
        }}>
          {activeUsers.length} online
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [82, 22] as any, scale: 900 }}
        width={540}
        height={600}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          {...ZOOM_CFG}
          onMoveEnd={handleMoveEnd}
        >
          {/* State outlines */}
          <Geographies geography={INDIA_TOPO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={(geo as any).rsmKey}
                  geography={geo}
                  fill="#F5F0E8"
                  stroke="#D4C9B0"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none", transition: "fill 0.15s" },
                    hover:   { fill: "#FEF3C7", outline: "none", cursor: "pointer" },
                    pressed: { fill: "#FDE68A", outline: "none" },
                  }}
                  // v2 API: Geography events receive (event, GeographyEventData)
                  onMouseEnter={(e: any, data: any) => {
                    const props = data?.geography?.properties;
                    const name =
                      props?.district
                        ? `${props.district}, ${props.st_nm}`
                        : props?.NAME_1 ?? props?.name ?? "";
                    if (name) setTooltip({ text: name, x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={clearTooltip}
                />
              ))
            }
          </Geographies>

          {/* Active user pins */}
          {activeUsers.map((user) => {
            const coords = getUserCoords(user);
            if (!coords) return null;

            const ageSec = Math.round(
              (Date.now() - new Date(user.timestamp).getTime()) / 1000
            );
            const isNew = ageSec < 30;

            return (
              <Marker
                key={user.sessionId}
                coordinates={coords}
                onMouseEnter={(e: React.MouseEvent) => {
                  const icon = user.device === "mobile" ? "📱" : user.device === "tablet" ? "📱" : "💻";
                  setTooltip({
                    text: `${icon} ${user.path}  ·  ${ageSec}s ago`,
                    x: e.clientX,
                    y: e.clientY,
                  });
                }}
                onMouseLeave={clearTooltip}
              >
                {/* Outer pulse ring */}
                <circle
                  r={isNew ? 14 : 9}
                  fill="#22C55E"
                  fillOpacity={0.18}
                  style={{
                    animation: "mapPulse 2s ease-in-out infinite",
                    transformOrigin: "center",
                  }}
                />
                {/* Inner dot */}
                <circle
                  r={5}
                  fill="#22C55E"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
                {/* "NEW" label for very recent sessions */}
                {isNew && (
                  <text
                    y={-14}
                    textAnchor="middle"
                    style={{ fontSize: 8, fill: "#16A34A", fontWeight: 700 }}
                  >
                    NEW
                  </text>
                )}
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x + 14,
            top: tooltip.y - 10,
            background: "#1A1208",
            color: "#fff",
            padding: "5px 10px",
            borderRadius: 4,
            fontSize: 12,
            zIndex: 9999,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 12px rgba(0,0,0,0.35)",
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend + instructions */}
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            display: "inline-block", width: 10, height: 10, borderRadius: "50%",
            background: "#22C55E",
          }} />
          <span style={{ fontSize: 11, color: "var(--color-ink-light)" }}>
            Active session (last 5 min)
          </span>
        </div>
        <span style={{ fontSize: 11, color: "var(--color-ink-light)" }}>
          Scroll to zoom · Drag to pan
        </span>
      </div>

      {/* Empty state */}
      {activeUsers.length === 0 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <p style={{
            background: "rgba(253,250,244,0.88)",
            backdropFilter: "blur(4px)",
            padding: "8px 18px",
            borderRadius: "var(--radius-sm)",
            fontSize: 13,
            color: "var(--color-ink-light)",
          }}>
            Waiting for visitors…
          </p>
        </div>
      )}
    </div>
  );
});
