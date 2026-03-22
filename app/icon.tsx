// app/icon.tsx
// Next.js 15 auto-generates /icon.png from this file using ImageResponse
// Eliminates the need for a static /public/icon.png file
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32, height: 32,
          background: "#1A1208",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          fontSize: 20,
          fontWeight: 300,
          color: "#C8960C",
          letterSpacing: 1,
        }}
      >
        N
      </div>
    ),
    { ...size }
  );
}
