"use client";
// components/store/MobileNav.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import { useState } from "react";
import { CartDrawer } from "./CartDrawer";

export function MobileNav() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.totalItems());
  const [cartOpen, setCartOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/shop", label: "Shop", icon: ShopIcon },
    { href: "/account/wishlist", label: "Wishlist", icon: HeartIcon },
    { href: "/account", label: "Account", icon: UserIcon },
  ];

  return (
    <>
      <nav className="mobile-nav" style={{ justifyContent: "space-around", alignItems: "center" }}>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "6px 12px", textDecoration: "none",
              color: pathname === href ? "var(--color-gold)" : "var(--color-ink-light)",
            }}
          >
            <Icon />
            <span style={{ fontSize: 10, letterSpacing: 0.5 }}>{label}</span>
          </Link>
        ))}
        <button
          onClick={() => setCartOpen(true)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            padding: "6px 12px", background: "none", border: "none",
            color: cartCount > 0 ? "var(--color-gold)" : "var(--color-ink-light)",
            position: "relative",
          }}
        >
          <BagIcon />
          {cartCount > 0 && (
            <span style={{
              position: "absolute", top: 2, right: 8,
              background: "var(--color-gold)", color: "#fff",
              borderRadius: "50%", width: 16, height: 16,
              fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700,
            }}>
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
          <span style={{ fontSize: 10, letterSpacing: 0.5 }}>Bag</span>
        </button>
      </nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

const HomeIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const ShopIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const HeartIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const UserIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const BagIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
