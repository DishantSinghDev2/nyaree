"use client";
// components/store/CartProvider.tsx
export function CartProvider({ children }: { children: React.ReactNode }) {
  // Zustand handles its own hydration — CartProvider is a slot for future context
  return <>{children}</>;
}
