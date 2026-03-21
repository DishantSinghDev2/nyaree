"use client";
// hooks/useAnalytics.ts
import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("nyaree_sid");
  if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem("nyaree_sid", id); }
  return id;
}

export function useAnalytics() {
  const pathname = usePathname();
  const lastPath = useRef("");

  const track = useCallback(async (
    type: string,
    meta?: Record<string, string | number | boolean>
  ) => {
    try {
      // Fire-and-forget — never await in hot paths
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, sessionId: getSessionId(), path: window.location.pathname, meta }),
        keepalive: true, // ensures event is sent even if page navigates away
      }).catch(() => {});
    } catch {}
  }, []);

  // Auto-track page views
  useEffect(() => {
    if (pathname !== lastPath.current) {
      lastPath.current = pathname;
      track("page_view");
    }
  }, [pathname, track]);

  return { track };
}

// Standalone tracker for non-hook contexts
export function trackEvent(type: string, meta?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  try {
    let sid = sessionStorage.getItem("nyaree_sid") ?? "";
    if (!sid) { sid = Math.random().toString(36).slice(2); sessionStorage.setItem("nyaree_sid", sid); }
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, sessionId: sid, path: window.location.pathname, meta }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
