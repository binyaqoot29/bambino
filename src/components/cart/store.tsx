"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/* --------------------------------------------------------------------------
 * Bag + wishlist state.
 *
 * Backed by a module-level store rather than component state so localStorage —
 * an external store — is read through `useSyncExternalStore`. That reads the
 * saved bag synchronously on the client at module load, keeps the server
 * snapshot empty, and lets React reconcile the two without a hydration
 * mismatch or a setState-in-effect cascade.
 *
 * When a real backend lands, swap `persist()` for cart mutations and keep the
 * `useBag()` API.
 * ----------------------------------------------------------------------- */

export type CartLine = {
  /** `${productId}::${size}::${colour}` — one line per variant. */
  key: string;
  productId: string;
  size: string;
  colour: string;
  quantity: number;
};

type Snapshot = {
  lines: CartLine[];
  wishlist: string[];
  /** False until localStorage has been read, so SSR and first paint agree. */
  ready: boolean;
};

const STORAGE_KEY = "bambino.bag.v1";
const MAX_QUANTITY = 99;

const SERVER_SNAPSHOT: Snapshot = { lines: [], wishlist: [], ready: false };

function read(): Snapshot {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lines: [], wishlist: [], ready: true };
    const parsed = JSON.parse(raw) as Partial<Snapshot>;
    return {
      lines: Array.isArray(parsed.lines) ? parsed.lines : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
      ready: true,
    };
  } catch {
    // Corrupt or unavailable storage: start empty rather than crash.
    return { lines: [], wishlist: [], ready: true };
  }
}

let snapshot: Snapshot =
  typeof window === "undefined" ? SERVER_SNAPSHOT : read();

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function commit(next: Omit<Snapshot, "ready">) {
  snapshot = { ...next, ready: true };
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ lines: snapshot.lines, wishlist: snapshot.wishlist }),
    );
  } catch {
    // Private mode / quota — the bag still works for this session.
  }
  for (const listener of listeners) listener();
}

function lineKey(productId: string, size: string, colour: string) {
  return `${productId}::${size}::${colour}`;
}

/* --- mutations ---------------------------------------------------------- */

function add(
  productId: string,
  size: string,
  colour: string,
  quantity: number,
) {
  const key = lineKey(productId, size, colour);
  const { lines, wishlist } = snapshot;
  const existing = lines.find((l) => l.key === key);

  commit({
    wishlist,
    lines: existing
      ? lines.map((l) =>
          l.key === key
            ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + quantity) }
            : l,
        )
      : [...lines, { key, productId, size, colour, quantity }],
  });
}

function setQuantity(key: string, quantity: number) {
  const { lines, wishlist } = snapshot;
  commit({
    wishlist,
    lines:
      quantity <= 0
        ? lines.filter((l) => l.key !== key)
        : lines.map((l) =>
            l.key === key
              ? { ...l, quantity: Math.min(MAX_QUANTITY, quantity) }
              : l,
          ),
  });
}

function remove(key: string) {
  commit({
    wishlist: snapshot.wishlist,
    lines: snapshot.lines.filter((l) => l.key !== key),
  });
}

function clearBag() {
  commit({ wishlist: snapshot.wishlist, lines: [] });
}

function toggleWish(productId: string) {
  const { lines, wishlist } = snapshot;
  commit({
    lines,
    wishlist: wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId],
  });
}

/* --- React surface ------------------------------------------------------ */

type BagContext = Snapshot & {
  count: number;
  addItem: (
    productId: string,
    size: string,
    colour: string,
    quantity?: number,
  ) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  /** Product id of the most recent add — drives the confirmation drawer. */
  lastAdded: string | null;
  dismissLastAdded: () => void;
};

const Context = createContext<BagContext | null>(null);

export function BagProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const addItem = useCallback(
    (productId: string, size: string, colour: string, quantity = 1) => {
      add(productId, size, colour, quantity);
      setLastAdded(productId);
    },
    [],
  );

  const dismissLastAdded = useCallback(() => setLastAdded(null), []);

  const value = useMemo<BagContext>(
    () => ({
      ...state,
      count: state.lines.reduce((n, l) => n + l.quantity, 0),
      addItem,
      setQuantity,
      removeItem: remove,
      clear: clearBag,
      toggleWishlist: toggleWish,
      isWishlisted: (productId: string) => state.wishlist.includes(productId),
      lastAdded,
      dismissLastAdded,
    }),
    [state, addItem, lastAdded, dismissLastAdded],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useBag() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useBag must be used inside <BagProvider>");
  return ctx;
}
