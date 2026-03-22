"use client";
// components/admin/AdminSidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth/client";
import { useState } from "react";

interface NavItem { href: string; label: string; icon: React.ReactNode; badge?: number; }

interface Props { user: { name?: string | null; email?: string | null; image?: string | null }; }

export function AdminSidebar({ user }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navGroups: { label: string; items: NavItem[] }[] = [
    {
      label: "Overview",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: <HomeIcon /> },
        { href: "/dashboard/analytics", label: "Analytics", icon: <ChartIcon /> },
      ],
    },
    {
      label: "Store",
      items: [
        { href: "/dashboard/products", label: "Products", icon: <ProductIcon /> },
        { href: "/dashboard/collections", label: "Collections", icon: <CollectionIcon /> },
        { href: "/dashboard/orders", label: "Orders", icon: <OrderIcon /> },
        { href: "/dashboard/customers", label: "Customers", icon: <UsersIcon /> },
      ],
    },
    {
      label: "Marketing",
      items: [
        { href: "/dashboard/hero-slides", label: "Hero Banners", icon: <ImageIcon /> },
        { href: "/dashboard/discounts", label: "Discounts", icon: <TagIcon /> },
        { href: "/dashboard/blog", label: "Blog", icon: <BlogIcon /> },
        { href: "/dashboard/reviews", label: "Reviews", icon: <StarIcon /> },
        { href: "/dashboard/enquiries", label: "Enquiries", icon: <ChatIcon /> },
      ],
    },
    {
      label: "Admin",
      items: [
        { href: "/dashboard/settings", label: "Settings", icon: <SettingsIcon /> },
      ],
    },
  ];

  const isActive = (href: string) => href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <aside className="admin-sidebar" style={{ width: collapsed ? 64 : 240, transition: "width 0.25s ease" }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? "20px 0" : "20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
        {!collapsed && (
          <Link href="/dashboard" style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 5, color: "#fff", textDecoration: "none" }}>
            NYA<span style={{ color: "var(--color-gold)" }}>REE</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", padding: 4 }}
          aria-label="Toggle sidebar"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {collapsed ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: 8 }}>
            {!collapsed && (
              <p style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", padding: "8px 16px 4px", fontFamily: "var(--font-body)" }}>
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                style={{
                  display: "flex", alignItems: "center",
                  gap: collapsed ? 0 : 10,
                  padding: collapsed ? "12px 0" : "10px 16px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  textDecoration: "none",
                  color: isActive(item.href) ? "#fff" : "rgba(255,255,255,0.55)",
                  background: isActive(item.href) ? "rgba(200,150,12,0.15)" : "transparent",
                  borderLeft: isActive(item.href) ? "3px solid var(--color-gold)" : "3px solid transparent",
                  transition: "all 0.15s",
                  position: "relative",
                }}
                onMouseEnter={(e) => { if (!isActive(item.href)) (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={(e) => { if (!isActive(item.href)) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; }}
              >
                <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
                {!collapsed && <span style={{ fontSize: 13, fontFamily: "var(--font-body)" }}>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span style={{ marginLeft: "auto", background: "var(--color-accent-red)", color: "#fff", borderRadius: "var(--radius-pill)", fontSize: 10, padding: "1px 6px", fontWeight: 700 }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: collapsed ? "12px 0" : "16px" }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "var(--color-ink)", flexShrink: 0 }}>
              {user.name?.[0]?.toUpperCase() ?? "R"}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name ?? "Rishika Singh"}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: collapsed ? "center" : "flex-start" }}>
          <Link href="/" target="_blank" style={{ flex: collapsed ? "none" : 1 }}>
            <button style={{ width: collapsed ? 36 : "100%", height: 32, background: "rgba(255,255,255,0.08)", border: "none", color: "rgba(255,255,255,0.6)", borderRadius: "var(--radius-sm)", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }} title="View Store">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              {!collapsed && "Store"}
            </button>
          </Link>
          <button
            onClick={() => signOut()}
            style={{ flex: collapsed ? "none" : 1, height: 32, background: "rgba(255,255,255,0.08)", border: "none", color: "rgba(255,255,255,0.6)", borderRadius: "var(--radius-sm)", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, width: collapsed ? 36 : undefined }}
            title="Logout"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {!collapsed && "Logout"}
          </button>
        </div>
      </div>
    </aside>
  );
}

// Icons
const HomeIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>;
const ChartIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const ProductIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/></svg>;
const CollectionIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const OrderIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const UsersIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const TagIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const BlogIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const StarIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const ImageIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const ChatIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const SettingsIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
