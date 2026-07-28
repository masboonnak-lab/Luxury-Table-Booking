import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  BRAND,
  BRAND_PRESETS,
  FONT_SCALES,
  paletteToCssVars,
  type BrandConfig,
  type BrandPalette,
} from "./brand";
import { translate, type Lang, type StringKey } from "./i18n";

/* --------------------------------------------------------------- records */

export interface TableBooking {
  kind: "table";
  id: string;
  code: string;
  bookerName: string;
  phone: string;
  guests: number;
  date: string;
  holdUntil: string;
  tableId: string | null;
  zoneName: string | null;
  amount: number;
  createdAt: number;
}

export interface EventTicket {
  kind: "ticket";
  id: string;
  code: string;
  bookerName: string;
  phone: string;
  eventId: string;
  eventTitle: string;
  quantity: number;
  date: string;
  holdUntil: string;
  amount: number;
  createdAt: number;
}

export type BookingRecord = TableBooking | EventTicket;

export interface AppUser {
  name: string;
  phone: string;
}

interface AppState {
  brand: BrandConfig;

  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: StringKey, vars?: Record<string, string>) => string;

  paletteId: string;
  setPaletteId: (id: string) => void;
  fontScaleId: string;
  setFontScaleId: (id: string) => void;
  cssVars: Record<string, string>;

  user: AppUser | null;
  signIn: (user: AppUser) => void;
  signOut: () => void;

  records: ReadonlyArray<BookingRecord>;
  addRecord: (r: BookingRecord) => void;

  /** Slip hashes already spent — the duplicate check reads this. */
  isSlipUsed: (hash: string) => boolean;
  markSlipUsed: (hash: string) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({
  children,
  brand = BRAND,
}: {
  children: ReactNode;
  brand?: BrandConfig;
}) {
  const [lang, setLang] = useState<Lang>("th");
  const [paletteId, setPaletteId] = useState(BRAND_PRESETS[0].id);
  const [fontScaleId, setFontScaleId] = useState("md");
  const [user, setUser] = useState<AppUser | null>(null);
  const [records, setRecords] = useState<ReadonlyArray<BookingRecord>>([]);
  const [usedSlips, setUsedSlips] = useState<ReadonlyArray<string>>([]);

  const palette: BrandPalette =
    BRAND_PRESETS.find((p) => p.id === paletteId)?.palette ?? brand.palette;
  const scale =
    FONT_SCALES.find((f) => f.id === fontScaleId)?.scale ??
    brand.typography.scale;

  const cssVars = useMemo(
    () => paletteToCssVars(palette, { ...brand.typography, scale }),
    [palette, brand.typography, scale],
  );

  const t = useCallback(
    (key: StringKey, vars?: Record<string, string>) =>
      translate(lang, key, vars),
    [lang],
  );

  const value: AppState = {
    brand,
    lang,
    setLang,
    t,
    paletteId,
    setPaletteId,
    fontScaleId,
    setFontScaleId,
    cssVars,
    user,
    signIn: setUser,
    signOut: () => setUser(null),
    records,
    // Newest first, so My Tickets needs no sorting.
    addRecord: (r) => setRecords((prev) => [r, ...prev]),
    isSlipUsed: (hash) => usedSlips.includes(hash),
    markSlipUsed: (hash) =>
      setUsedSlips((prev) => (prev.includes(hash) ? prev : [...prev, hash])),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useApp must be used inside <AppProvider>");
  }
  return ctx;
}
