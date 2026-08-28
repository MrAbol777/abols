"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/**
 * Client-side cart persisted in localStorage, backed by a tiny external store
 * so hydration never produces a server/client mismatch.
 *
 * IMPORTANT: The cart only stores { productId, quantity } plus a price/name
 * snapshot for DISPLAY. Prices are NEVER trusted at checkout — the server
 * recomputes every price from the database when the order is placed.
 */

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number; // display snapshot only
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number; // total units
  subtotal: number; // display snapshot only
  hydrated: boolean;
  addItem: (item: CartItem) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "abol_cart_v1";

const EMPTY: CartItem[] = [];

const CartContext = createContext<CartContextValue | null>(null);

function clampQuantity(q: number): number {
  if (!Number.isFinite(q)) return 1;
  return Math.min(99, Math.max(1, Math.floor(q)));
}

function readPersistedItems(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is CartItem =>
        !!x &&
        typeof x === "object" &&
        typeof (x as CartItem).productId === "string" &&
        typeof (x as CartItem).slug === "string" &&
        typeof (x as CartItem).name === "string" &&
        typeof (x as CartItem).price === "number" &&
        typeof (x as CartItem).quantity === "number",
    ).map((x) => ({ ...x, quantity: clampQuantity(x.quantity) }));
  } catch {
    return [];
  }
}

/* External store (module-level singleton, safe for a single provider) ------- */
let cached: CartItem[] | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): CartItem[] {
  if (typeof window === "undefined") return EMPTY; // server snapshot
  if (cached === null) cached = readPersistedItems();
  return cached;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function commit(next: CartItem[]): void {
  cached = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / private-mode write errors
  }
  listeners.forEach((l) => l());
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((item: CartItem) => {
    const current = getSnapshot();
    const existing = current.find((i) => i.productId === item.productId);
    if (existing) {
      commit(
        current.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: clampQuantity(i.quantity + item.quantity) }
            : i,
        ),
      );
      return;
    }
    commit([...current, { ...item, quantity: clampQuantity(item.quantity) }]);
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    commit(
      getSnapshot().map((i) =>
        i.productId === productId ? { ...i, quantity: clampQuantity(quantity) } : i,
      ),
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    commit(getSnapshot().filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => {
    commit([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return {
      items,
      count,
      subtotal,
      hydrated: true,
      addItem,
      setQuantity,
      removeItem,
      clear,
    };
  }, [items, addItem, setQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}