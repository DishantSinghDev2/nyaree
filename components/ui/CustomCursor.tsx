"use client";
// components/ui/CustomCursor.tsx
import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const isMobile = window.matchMedia("(hover: none)").matches;
    if (isMobile) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const onEnterLink = () => {
      if (ring) ring.style.transform = "translate(-50%,-50%) scale(1.8)";
      if (dot) dot.style.opacity = "0";
    };
    const onLeaveLink = () => {
      if (ring) ring.style.transform = "translate(-50%,-50%) scale(1)";
      if (dot) dot.style.opacity = "1";
    };

    const animate = () => {
      if (dot) {
        dot.style.left = pos.current.x + "px";
        dot.style.top = pos.current.y + "px";
      }
      // Ring follows with lerp for smooth lag
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12;
      if (ring) {
        ring.style.left = ringPos.current.x + "px";
        ring.style.top = ringPos.current.y + "px";
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", move);
    document.querySelectorAll("a,button,[role='button']").forEach((el) => {
      el.addEventListener("mouseenter", onEnterLink);
      el.addEventListener("mouseleave", onLeaveLink);
    });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: "fixed", pointerEvents: "none", zIndex: 9999,
          width: 6, height: 6, borderRadius: "50%",
          background: "var(--color-gold)", transform: "translate(-50%,-50%)",
          transition: "opacity 0.15s",
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: "fixed", pointerEvents: "none", zIndex: 9998,
          width: 28, height: 28, borderRadius: "50%",
          border: "1.5px solid var(--color-gold)", transform: "translate(-50%,-50%)",
          transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          opacity: 0.6,
        }}
      />
    </>
  );
}
