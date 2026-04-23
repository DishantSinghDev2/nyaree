"use client";
// components/store/Header.tsx
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { useSession } from "@/lib/auth/client";
import { CartDrawer } from "./CartDrawer";
import { SearchModal } from "./SearchModal";

const NAV_LINKS = [
  {
    label: "Shop",
    href: "/shop",
    mega: [
      { label: "All Products", href: "/shop" },
      { label: "Kurtis", href: "/shop/kurti" },
      { label: "Tops", href: "/shop/top" },
      { label: "Co-ord Sets", href: "/shop/coord-set" },
      { label: "New Arrivals", href: "/collections/new-arrivals" },
      { label: "Sale", href: "/collections/sale" },
    ],
  },
  { label: "Collections", href: "/collections" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export function Header() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = useCartStore((s) => s.totalItems());
  const wishlistCount = useCartStore((s) => s.wishlistCount());
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mega menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMegaOpen(null);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        style={{
          position: "sticky", top: 0, zIndex: "var(--z-overlay)" as any,
          background: scrolled ? "rgba(253,250,244,0.97)" : "var(--color-ivory)",
          borderBottom: `1px solid ${scrolled ? "var(--color-border)" : "transparent"}`,
          backdropFilter: scrolled ? "blur(12px)" : "none",
          transition: "all 0.3s ease",
          boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", height: 64, gap: 24 }}>

          {/* Hamburger (mobile) */}
          <button
            className="show-mobile"
            onClick={() => setMobileMenuOpen(true)}
            style={{ background: "none", border: "none", padding: 4 }}
            aria-label="Open menu"
          >
            <HamburgerIcon />
          </button>

          {/* Logo */}
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: 6,
              fontWeight: 400, color: "var(--color-ink)", textDecoration: "none",
              flexShrink: 0,
            }}
          >
            NYA<span style={{ color: "var(--color-gold)" }}>REE</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hide-mobile" style={{ display: "flex", gap: 0, marginLeft: 24, flex: 1 }}>
            {NAV_LINKS.map((link) => (
              <div
                key={link.label}
                style={{ position: "relative" }}
                onMouseEnter={() => link.mega && setMegaOpen(link.label)}
                onMouseLeave={() => setMegaOpen(null)}
              >
                <Link
                  href={link.href}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "0 16px", height: 64,
                    fontFamily: "var(--font-body)", fontSize: 12,
                    fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase",
                    color: megaOpen === link.label ? "var(--color-gold)" : "var(--color-ink)",
                    textDecoration: "none", transition: "color 0.2s",
                    borderBottom: megaOpen === link.label ? "2px solid var(--color-gold)" : "2px solid transparent",
                  }}
                >
                  {link.label}
                  {link.mega && <ChevronDown size={12} />}
                </Link>

                {/* Mega dropdown */}
                {link.mega && megaOpen === link.label && (
                  <div
                    style={{
                      position: "absolute", top: "100%", left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--color-surface)", border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)", boxShadow: "var(--shadow-lg)",
                      padding: "12px 0", minWidth: 180,
                      animation: "fadeIn 0.15s ease",
                    }}
                  >
                    {link.mega.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          display: "block", padding: "10px 20px",
                          fontSize: 13, color: "var(--color-ink-muted)",
                          textDecoration: "none", transition: "all 0.15s",
                          fontFamily: "var(--font-body)",
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLElement).style.color = "var(--color-gold)";
                          (e.target as HTMLElement).style.paddingLeft = "28px";
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLElement).style.color = "var(--color-ink-muted)";
                          (e.target as HTMLElement).style.paddingLeft = "20px";
                        }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
            {/* Search */}
            <IconBtn onClick={() => setSearchOpen(true)} label="Search">
              <SearchIcon />
            </IconBtn>

            {/* Wishlist */}
            <Link href="/account/wishlist" style={{ display: "flex" }}>
              <IconBtn label="Wishlist" count={wishlistCount}>
                <HeartIcon />
              </IconBtn>
            </Link>

            {/* Account — show admin badge for admins */}
            <div style={{ position: "relative" }}>
              <Link href={(session?.user as any)?.role === "admin" ? "/dashboard" : "/account"} style={{ display: "flex" }}>
                <IconBtn label={(session?.user as any)?.role === "admin" ? "Admin" : "Account"}>
                  <UserIcon />
                </IconBtn>
              </Link>
              {(session?.user as any)?.role === "admin" && (
                <span style={{ position: "absolute", top: 2, right: 2, width: 8, height: 8, borderRadius: "50%", background: "var(--color-gold)", border: "2px solid var(--color-ivory)" }} />
              )}
            </div>

            {/* Cart */}
            <IconBtn onClick={() => setCartOpen(true)} label="Cart" count={cartCount} primary>
              <BagIcon />
            </IconBtn>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div className="backdrop" onClick={() => setMobileMenuOpen(false)} style={{ zIndex: 150 }} />
          <div
            style={{
              position: "fixed", top: 0, left: 0, bottom: 0, width: "80vw", maxWidth: 320,
              background: "var(--color-ivory)", zIndex: 151, overflow: "auto",
              animation: "slideInLeft 0.3s ease",
              display: "flex", flexDirection: "column",
            }}
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 5 }}>
                NYA<span style={{ color: "var(--color-gold)" }}>REE</span>
              </span>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: "none", border: "none", fontSize: 24 }}>×</button>
            </div>
            <nav style={{ padding: "16px 0" }}>
              {NAV_LINKS.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: "block", padding: "14px 24px",
                      fontFamily: "var(--font-body)", fontSize: 13,
                      fontWeight: 500, letterSpacing: "1.5px",
                      textTransform: "uppercase", color: "var(--color-ink)",
                      textDecoration: "none", borderBottom: "1px solid var(--color-border-light)",
                    }}
                  >
                    {link.label}
                  </Link>
                  {link.mega?.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: "block", padding: "10px 24px 10px 36px",
                        fontSize: 13, color: "var(--color-ink-light)",
                        textDecoration: "none", borderBottom: "1px solid var(--color-border-light)",
                      }}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
            <div style={{ padding: "16px 24px", marginTop: "auto", borderTop: "1px solid var(--color-border)" }}>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-dark btn-full"
              >
                My Account
              </Link>
            </div>
          </div>
        </>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function IconBtn({
  onClick, label, children, count, primary,
}: {
  onClick?: () => void; label: string; children: React.ReactNode;
  count?: number; primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        background: primary && count ? "var(--color-gold)" : "none",
        border: "none", borderRadius: "var(--radius-sm)",
        padding: "8px 10px", display: "flex", alignItems: "center",
        gap: 4, color: primary && count ? "#fff" : "var(--color-ink)",
        position: "relative", cursor: "pointer",
        transition: "background 0.2s, color 0.2s",
      }}
    >
      {children}
      {!!count && (
        <span
          style={{
            position: "absolute", top: 2, right: 2,
            background: primary ? "#fff" : "var(--color-gold)",
            color: primary ? "var(--color-gold)" : "#fff",
            borderRadius: "50%", width: 16, height: 16,
            fontSize: 10, fontWeight: 700, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

// ─── Inline SVG icons (no external lib) ──────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const HeartIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const BagIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
const HamburgerIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const ChevronDown = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
