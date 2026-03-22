// lib/store/cart.ts
// Zustand v5 + persist middleware — SSR-safe for Next.js 15 + React 19
// Key fix: skipHydration: true prevents localStorage access during SSR
// Rehydration is triggered client-side in CartProvider via useEffect
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  wishlist: string[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQty: (productId: string, variantId: string, qty: number) => void;
  clearCart: () => void;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  totalItems: () => number;
  wishlistCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],

      addItem: (item) => {
        const items = get().items;
        const existing = items.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        );
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId && i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },

      removeItem: (productId, variantId) =>
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }),

      updateQty: (productId, variantId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: qty }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      addToWishlist: (productId) => {
        if (!get().wishlist.includes(productId)) {
          set({ wishlist: [...get().wishlist, productId] });
        }
      },

      removeFromWishlist: (productId) =>
        set({ wishlist: get().wishlist.filter((id) => id !== productId) }),

      isWishlisted: (productId) => get().wishlist.includes(productId),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      wishlistCount: () => get().wishlist.length,
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "nyaree-cart",
      // Use localStorage explicitly — createJSONStorage handles SSR safety
      storage: createJSONStorage(() => {
        // Guard: during SSR localStorage doesn't exist
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      // CRITICAL: skip auto-hydration on mount — we trigger it manually in
      // CartProvider after the client has fully hydrated, preventing the
      // "Cannot read properties of undefined" webpack error in Next.js 15
      skipHydration: true,
    }
  )
);
