"use client";
// components/store/AnalyticsProvider.tsx
// Wraps the store to auto-track page views on every route change
import { useAnalytics } from "@/hooks/useAnalytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useAnalytics(); // auto-tracks page_view on every pathname change
  return <>{children}</>;
}
