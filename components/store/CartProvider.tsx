"use client";
// components/store/CartProvider.tsx
// Triggers Zustand persist rehydration AFTER client hydration completes
// This is required when using skipHydration:true in the store
// See: https://docs.pmnd.rs/zustand/integrations/persisting-store-data#skiphydration
import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Rehydrate the store from localStorage after the client has mounted
    // This prevents the SSR/client mismatch that causes the webpack
    // "Cannot read properties of undefined (reading 'call')" error
    useCartStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
