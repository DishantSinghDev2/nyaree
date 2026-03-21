"use client";
// components/store/SizeChartBanner.tsx
import { useState } from "react";

export function SizeChartBanner() {
  const [open, setOpen] = useState(false);
  const sizes = [
    { size: "XS", chest: "32", waist: "26", hip: "35", length: "44" },
    { size: "S",  chest: "34", waist: "28", hip: "37", length: "44" },
    { size: "M",  chest: "36", waist: "30", hip: "39", length: "45" },
    { size: "L",  chest: "38", waist: "32", hip: "41", length: "46" },
    { size: "XL", chest: "40", waist: "34", hip: "43", length: "46" },
    { size: "XXL",chest: "42", waist: "36", hip: "45", length: "47" },
    { size: "3XL",chest: "44", waist: "38", hip: "47", length: "48" },
  ];

  return (
    <>
      <section style={{ background: "var(--color-ink)", padding: "48px 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 8 }}>
              Perfect Fit, Every Time
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 300, color: "#fff" }}>
              We Make to Your Measurements
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>
              All our pieces are crafted on demand. View our size guide and request custom sizing.
            </p>
          </div>
          <button className="btn btn-outline" style={{ borderColor: "var(--color-gold)", color: "var(--color-gold)" }} onClick={() => setOpen(true)}>
            View Size Chart
          </button>
        </div>
      </section>

      {open && (
        <>
          <div className="backdrop" onClick={() => setOpen(false)} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            zIndex: 250, background: "var(--color-surface)", padding: 40,
            borderRadius: "var(--radius-sm)", width: "min(640px, 95vw)",
            maxHeight: "80vh", overflow: "auto", animation: "scaleIn 0.2s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>Size Chart</h2>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", fontSize: 24 }}>×</button>
            </div>
            <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginBottom: 20 }}>
              All measurements are in inches. For custom sizing, use the enquiry button on any product page.
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Size</th><th>Chest</th><th>Waist</th><th>Hip</th><th>Kurti Length</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((s) => (
                    <tr key={s.size}>
                      <td><strong>{s.size}</strong></td>
                      <td>{s.chest}"</td><td>{s.waist}"</td>
                      <td>{s.hip}"</td><td>{s.length}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginTop: 16 }}>
              💡 Need a different size? We make on demand — just use the <strong>Ask About This Product</strong> button!
            </p>
          </div>
        </>
      )}
    </>
  );
}
