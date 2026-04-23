"use client";
import React, { useState } from "react";

export default function ScratchCard({ code }: { code: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div style={{ 
      position: "relative", 
      width: "100%", 
      maxWidth: "300px", 
      height: "100px", 
      margin: "0 auto",
      borderRadius: "var(--radius-md)", 
      overflow: "hidden",
      cursor: revealed ? "default" : "pointer",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}>
      {/* Revealed State */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, #FFEFD5, #FFE4B5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: "2px dashed var(--color-gold)",
        zIndex: 1
      }}>
        <p style={{ fontSize: 12, color: "var(--color-ink-light)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Use code for next order</p>
        <p style={{ fontSize: 24, fontWeight: 700, color: "var(--color-gold)", letterSpacing: 2 }}>{code}</p>
      </div>

      {/* Unrevealed (Scratch) State */}
      <div 
        onClick={() => setRevealed(true)}
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, #1A1208, #2D1E0A)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
          transition: "opacity 0.6s ease",
          opacity: revealed ? 0 : 1,
          pointerEvents: revealed ? "none" : "auto",
        }}
      >
        <span style={{ fontSize: 24, marginBottom: 4 }}>🎁</span>
        <p style={{ color: "#fff", fontWeight: 500, fontSize: 14 }}>Tap to reveal your gift!</p>
      </div>
    </div>
  );
}
