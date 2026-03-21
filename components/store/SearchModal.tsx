"use client";
// components/store/SearchModal.tsx
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface Props { open: boolean; onClose: () => void; }

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
    else setQuery(""); setResults([]);
  }, [open]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        setResults(data.data?.items ?? []);
      } finally { setLoading(false); }
    }, 280);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

  if (!open) return null;

  return (
    <>
      <div className="backdrop" onClick={onClose} style={{ zIndex: 195 }} />
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 196,
        background: "var(--color-ivory)", padding: "24px",
        boxShadow: "var(--shadow-xl)", animation: "fadeInDown 0.2s ease",
      }}>
        <div className="container" style={{ maxWidth: 700 }}>
          {/* Input */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "2px solid var(--color-gold)", paddingBottom: 8 }}>
            <svg width="20" height="20" fill="none" stroke="var(--color-gold)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search kurtis, tops, collections..."
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontFamily: "var(--font-display)", fontSize: 22, color: "var(--color-ink)",
              }}
              onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
            />
            {loading && <span className="animate-spin" style={{ width: 16, height: 16, border: "2px solid var(--color-border)", borderTopColor: "var(--color-gold)", borderRadius: "50%", display: "inline-block" }} />}
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, color: "var(--color-ink-light)" }}>×</button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {results.map((p: any) => {
                const minV = p.variants?.[0];
                const img = p.images?.find((i: any) => i.isHero) ?? p.images?.[0];
                return (
                  <Link
                    key={p._id}
                    href={`/product/${p.slug}`}
                    onClick={onClose}
                    style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 12px", borderRadius: "var(--radius-sm)", textDecoration: "none", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-ivory-dark)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <div style={{ width: 44, height: 56, background: "var(--color-ivory-dark)", borderRadius: 2, position: "relative", overflow: "hidden", flexShrink: 0 }}>
                      {img && <Image src={img.url} alt={p.name} fill style={{ objectFit: "cover" }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--color-ink)", marginBottom: 2 }}>{p.name}</p>
                      <p style={{ fontSize: 12, color: "var(--color-ink-light)" }}>{p.category} · {minV ? fmt(minV.price) : ""}</p>
                    </div>
                    <svg width="16" height="16" fill="none" stroke="var(--color-ink-light)" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                  </Link>
                );
              })}
              <Link href={`/search?q=${encodeURIComponent(query)}`} onClick={onClose} style={{ display: "block", textAlign: "center", padding: "10px", fontSize: 12, color: "var(--color-gold)", letterSpacing: 1, textDecoration: "none" }}>
                View all results for "{query}" →
              </Link>
            </div>
          )}

          {/* Quick links when empty */}
          {!query && (
            <div style={{ marginTop: 24 }}>
              <p style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--color-ink-light)", marginBottom: 12 }}>Popular Searches</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Cotton Kurti", "Floral Top", "Printed Kurti", "Festive Wear", "Under ₹499"].map((t) => (
                  <button key={t} onClick={() => setQuery(t)} style={{ padding: "6px 14px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-pill)", background: "none", fontSize: 12, color: "var(--color-ink-muted)", cursor: "pointer" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
