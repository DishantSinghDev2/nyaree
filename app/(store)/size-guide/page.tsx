// app/(store)/size-guide/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Size Guide | Nyaree — Find Your Perfect Fit",
  description: "Use Nyaree's detailed size guide to find your perfect kurti and top size. Includes chest, waist, hip, and length measurements for all sizes XS to 3XL.",
  alternates: { canonical: "https://buynyaree.com/size-guide" },
};

const KURTI_SIZES = [
  { size: "XS", chest: "32", waist: "26", hip: "35", length: "42–44" },
  { size: "S",  chest: "34", waist: "28", hip: "37", length: "42–44" },
  { size: "M",  chest: "36", waist: "30", hip: "39", length: "44–46" },
  { size: "L",  chest: "38", waist: "32", hip: "41", length: "44–46" },
  { size: "XL", chest: "40", waist: "34", hip: "43", length: "46–48" },
  { size: "2XL",chest: "42", waist: "36", hip: "45", length: "46–48" },
  { size: "3XL",chest: "44", waist: "38", hip: "47", length: "48–50" },
];

const TOP_SIZES = [
  { size: "XS", chest: "32", waist: "26", length: "22–24" },
  { size: "S",  chest: "34", waist: "28", length: "22–24" },
  { size: "M",  chest: "36", waist: "30", length: "24–26" },
  { size: "L",  chest: "38", waist: "32", length: "24–26" },
  { size: "XL", chest: "40", waist: "34", length: "26–28" },
  { size: "2XL",chest: "42", waist: "36", length: "26–28" },
  { size: "3XL",chest: "44", waist: "38", length: "28–30" },
];

const thStyle: React.CSSProperties = {
  padding: "12px 16px", background: "var(--color-ink)", color: "#fff",
  fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 500,
  textTransform: "uppercase", letterSpacing: 1, textAlign: "center",
};
const tdStyle: React.CSSProperties = {
  padding: "12px 16px", textAlign: "center", fontSize: 14,
  borderBottom: "1px solid var(--color-border-light)",
};

export default function SizeGuidePage() {
  return (
    <div>
      <section style={{ background: "var(--color-ink)", padding: "64px 0 48px", textAlign: "center" }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 12 }}>
            Find Your Fit
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 300, color: "#fff", marginBottom: 12 }}>
            Size Guide
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
            All measurements are in inches. When in doubt, size up.
          </p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: 900, padding: "64px 0 80px" }}>
        {/* How to measure */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, marginBottom: 32 }}>
            How to Measure Yourself
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
            {[
              { label: "Chest (Bust)", icon: "📏", desc: "Measure around the fullest part of your chest, keeping the tape parallel to the ground." },
              { label: "Waist", icon: "〰️", desc: "Measure around the narrowest part of your waist, usually 1 inch above the navel." },
              { label: "Hip", icon: "📐", desc: "Measure around the fullest part of your hips, about 8 inches below the waist." },
              { label: "Length", icon: "↕️", desc: "Measured from the shoulder seam to the hem. Kurti lengths are approximate." },
            ].map(m => (
              <div key={m.label} className="card" style={{ padding: 20 }}>
                <p style={{ fontSize: 28, marginBottom: 10 }}>{m.icon}</p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 8 }}>{m.label}</p>
                <p style={{ fontSize: 13, color: "var(--color-ink-light)", lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Kurti size chart */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400, marginBottom: 20 }}>
            Kurti & Co-ord Set Sizes
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", borderRadius: "var(--radius-sm)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Size</th>
                  <th style={thStyle}>Chest (in)</th>
                  <th style={thStyle}>Waist (in)</th>
                  <th style={thStyle}>Hip (in)</th>
                  <th style={thStyle}>Length (in)</th>
                </tr>
              </thead>
              <tbody>
                {KURTI_SIZES.map((row, i) => (
                  <tr key={row.size} style={{ background: i % 2 === 0 ? "var(--color-ivory)" : "#fff" }}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: "var(--color-gold)" }}>{row.size}</td>
                    <td style={tdStyle}>{row.chest}"</td>
                    <td style={tdStyle}>{row.waist}"</td>
                    <td style={tdStyle}>{row.hip}"</td>
                    <td style={tdStyle}>{row.length}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tops size chart */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400, marginBottom: 20 }}>
            Tops & Shirts
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", borderRadius: "var(--radius-sm)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Size</th>
                  <th style={thStyle}>Chest (in)</th>
                  <th style={thStyle}>Waist (in)</th>
                  <th style={thStyle}>Length (in)</th>
                </tr>
              </thead>
              <tbody>
                {TOP_SIZES.map((row, i) => (
                  <tr key={row.size} style={{ background: i % 2 === 0 ? "var(--color-ivory)" : "#fff" }}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: "var(--color-gold)" }}>{row.size}</td>
                    <td style={tdStyle}>{row.chest}"</td>
                    <td style={tdStyle}>{row.waist}"</td>
                    <td style={tdStyle}>{row.length}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips */}
        <div style={{ background: "#FEF9EC", border: "1px solid var(--color-gold)", borderRadius: "var(--radius-sm)", padding: "24px 28px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 16 }}>💡 Sizing Tips</h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 20, fontSize: 14, color: "var(--color-ink-muted)", lineHeight: 1.7 }}>
            <li>If you're between sizes, we recommend sizing up for a relaxed fit or sizing down for a fitted look.</li>
            <li>Kurti lengths may vary ±1 inch depending on the style.</li>
            <li>Fabric shrinkage: cotton fabrics may shrink 1–2% after the first wash. We account for this in our sizing.</li>
            <li>All measurements are body measurements, not garment measurements.</li>
          </ul>
        </div>

        <div style={{ marginTop: 40, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--color-ink-light)", marginBottom: 16 }}>
            Not sure about your size? We're happy to help.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://wa.me/918368989758" target="_blank" rel="noopener noreferrer">
              <button className="btn btn-primary">Ask on WhatsApp</button>
            </a>
            <Link href="/custom-order">
              <button className="btn btn-outline">Request Custom Size</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
