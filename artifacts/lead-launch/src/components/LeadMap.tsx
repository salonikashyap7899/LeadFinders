import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Lead } from "@/lib/types";

function FitBounds({ leads }: { leads: Lead[] }) {
  const map = useMap();
  useEffect(() => {
    if (leads.length < 1) return;
    if (leads.length === 1) {
      map.setView([leads[0].lat, leads[0].lng], 15);
      return;
    }
    const lats = leads.map(l => l.lat);
    const lngs = leads.map(l => l.lng);
    map.fitBounds(
      [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]],
      { padding: [28, 28], maxZoom: 16 }
    );
  }, [leads.length]);
  return null;
}

export default function LeadMap({ leads }: { leads: Lead[] }) {
  const center: [number, number] = leads.length > 0
    ? [leads.reduce((s, l) => s + l.lat, 0) / leads.length, leads.reduce((s, l) => s + l.lng, 0) / leads.length]
    : [20.5937, 78.9629];

  return (
    <div style={{ height: "100%", width: "100%", borderRadius: 12, overflow: "hidden", position: "relative" }}>
      {/* overlay strip for branding */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000, display: "flex", gap: 6, pointerEvents: "none" }}>
        {leads.length > 0 && (
          <>
            <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)", color: "#a78bfa", fontWeight: 700, letterSpacing: "0.5px" }}>
              📍 {leads.length} pins
            </span>
            <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)", color: "#f87171", fontWeight: 600 }}>
              🔴 {leads.filter(l => !l.website).length} no site
            </span>
            <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)", color: "#34d399", fontWeight: 600 }}>
              🟢 {leads.filter(l => l.website).length} has site
            </span>
          </>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={leads.length === 0 ? 4 : 13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds leads={leads} />
        {leads.map((l) => {
          const hasWebsite = !!l.website;
          return (
            <CircleMarker
              key={l.id}
              center={[l.lat, l.lng]}
              radius={hasWebsite ? 8 : 10}
              pathOptions={{
                color: hasWebsite ? "#059669" : "#dc2626",
                fillColor: hasWebsite ? "#10b981" : "#ef4444",
                fillOpacity: 0.88,
                weight: 2,
              }}
            >
              <Popup>
                <div style={{ minWidth: 180, fontFamily: "Inter, sans-serif" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{l.name}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{l.address}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {l.phone && <a href={`tel:${l.phone}`} style={{ fontSize: 11, color: "#7c3aed", textDecoration: "none" }}>📞 {l.phone}</a>}
                    {l.whatsapp && <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener" style={{ fontSize: 11, color: "#25d366", textDecoration: "none" }}>💬 WhatsApp</a>}
                    {l.website ? <a href={l.website} target="_blank" rel="noopener" style={{ fontSize: 11, color: "#06b6d4", textDecoration: "none" }}>🌐 Visit site</a>
                      : <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 600 }}>🚫 No website — opportunity!</span>}
                    {l.rating && <span style={{ fontSize: 11, color: "#f59e0b" }}>⭐ {l.rating} ({l.reviewsCount} reviews)</span>}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
