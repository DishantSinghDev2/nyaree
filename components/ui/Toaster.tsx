"use client";
// components/ui/Toaster.tsx
import { useEffect, useState, createContext, useContext, useCallback } from "react";

type ToastType = "success" | "error" | "info";
interface Toast { id: string; message: string; type: ToastType; }

const ToastContext = createContext<{
  toast: (message: string, type?: ToastType) => void;
}>({ toast: () => {} });

export function useToast() { return useContext(ToastContext); }

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // Expose globally
  useEffect(() => {
    (window as any).__nyareeToast = toast;
  }, [toast]);

  const icons = { success: "✓", error: "✕", info: "i" };

  return (
    <ToastContext.Provider value={{ toast }}>
      <div className="toast-container" style={{ position: "fixed", bottom: 80, right: 20, zIndex: 9000, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast-${t.type} animate-fade-in-up`}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "var(--color-ink)", color: "#fff",
              padding: "12px 20px", borderRadius: "var(--radius-sm)",
              fontSize: 13, boxShadow: "var(--shadow-lg)",
              borderLeft: `3px solid ${t.type === "success" ? "var(--color-success)" : t.type === "error" ? "var(--color-accent-red)" : "var(--color-gold)"}`,
              maxWidth: 320, minWidth: 200,
            }}
          >
            <span style={{
              width: 20, height: 20, borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
              background: t.type === "success" ? "var(--color-success)" : t.type === "error" ? "var(--color-accent-red)" : "var(--color-gold)",
              flexShrink: 0,
            }}>
              {icons[t.type]}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function showToast(message: string, type: ToastType = "info") {
  if (typeof window !== "undefined" && (window as any).__nyareeToast) {
    (window as any).__nyareeToast(message, type);
  }
}
