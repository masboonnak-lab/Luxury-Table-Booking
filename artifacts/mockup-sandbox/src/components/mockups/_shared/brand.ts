/**
 * White-label configuration. Everything a new client needs to change lives in
 * this file — colours, fonts, type scale, venue details and which menu tiles
 * appear. No component hard-codes a brand colour; they all read the CSS
 * variables that `BrandProvider` writes from this object.
 */

export interface BrandPalette {
  /** Page background and the inside of every framed tile. */
  background: string;
  /** Gold: icons, tile borders, headings, footer text. */
  gold: string;
  /** A lighter gold for hover/gradient accents. */
  goldSoft: string;
  /** Body copy. */
  text: string;
  /** De-emphasised body copy. */
  textMuted: string;
  /** Hairlines that should not read as gold. */
  line: string;
  danger: string;
  success: string;
}

export interface BrandTypography {
  display: string;
  body: string;
  /** Multiplies every step of the type scale. 1 = default. */
  scale: number;
}

export type MenuId =
  | "myTickets"
  | "buyTicket"
  | "contact"
  | "bookTable"
  | "location"
  | "terms";

export interface MenuTile {
  id: MenuId;
  side: "left" | "right";
  /** Hide a tile for clients that do not sell event tickets, etc. */
  enabled: boolean;
}

export interface BrandConfig {
  venueName: string;
  venueTagline: string;
  palette: BrandPalette;
  typography: BrandTypography;
  menu: ReadonlyArray<MenuTile>;
  /** Shown on the location screen and used for the map embed. */
  address: string;
  mapQuery: string;
  phone: string;
  email: string;
  lineOfficial: string;
  facebook: string;
  instagram: string;
  /** Latest time a held table is released, as HH:mm. */
  tableHoldUntil: string;
  paymentWindowMinutes: number;
  promptPayId: string;
  legalName: string;
  taxId: string;
  receiptPrefix: string;
  minimumAge: number;
  /** Set false for clients whose room has no fixed table plan. */
  hasFloorPlan: boolean;
  /** Builder credit in the footer. */
  signature: { label: string; url: string };
}

/** Default client: a Thonglor-style luxury bar — black and gold. */
export const BRAND: BrandConfig = {
  venueName: "TEST LAB DRINK",
  venueTagline: "Cocktail Bar & Lounge · Thonglor",

  palette: {
    background: "#000000",
    gold: "#D4AF37",
    goldSoft: "#F0D98C",
    text: "#FFFFFF",
    textMuted: "rgba(255,255,255,0.62)",
    line: "rgba(212,175,55,0.28)",
    danger: "#E5484D",
    success: "#3DD68C",
  },

  typography: {
    display: "'Playfair Display', Georgia, serif",
    body: "'Inter', 'Leelawadee UI', system-ui, sans-serif",
    scale: 1,
  },

  menu: [
    { id: "myTickets", side: "left", enabled: true },
    { id: "buyTicket", side: "left", enabled: true },
    { id: "contact", side: "left", enabled: true },
    { id: "bookTable", side: "right", enabled: true },
    { id: "location", side: "right", enabled: true },
    { id: "terms", side: "right", enabled: true },
  ],

  address: "123 ซอยทองหล่อ 10 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110",
  mapQuery: "Thonglor 10, Watthana, Bangkok",
  phone: "02 123 4567",
  email: "reserve@testlabdrink.com",
  lineOfficial: "@testlabdrink",
  facebook: "testlabdrink",
  instagram: "testlabdrink",

  tableHoldUntil: "20:30",
  paymentWindowMinutes: 10,
  promptPayId: "0-2123-4567",
  legalName: "บริษัท เทสต์ แล็บ ดริ๊งค์ จำกัด",
  taxId: "0-1055-00000-00-0",
  receiptPrefix: "TLD",
  minimumAge: 20,
  hasFloorPlan: true,
  // TODO: replace with your studio's name and site before shipping to a client.
  signature: { label: "Agoon Studio", url: "https://example.com" },
};

/**
 * Alternate presets, kept here to prove the theming actually is data-driven.
 * Switch with the palette picker in the drawer.
 */
export const BRAND_PRESETS: ReadonlyArray<{
  id: string;
  label: string;
  palette: BrandPalette;
}> = [
  {
    id: "gold",
    label: "Black & Gold",
    palette: BRAND.palette,
  },
  {
    id: "champagne",
    label: "Champagne",
    palette: {
      ...BRAND.palette,
      gold: "#E8D5A3",
      goldSoft: "#F7EDD4",
      line: "rgba(232,213,163,0.30)",
    },
  },
  {
    id: "rose",
    label: "Rose Gold",
    palette: {
      ...BRAND.palette,
      gold: "#E0A899",
      goldSoft: "#F3CFC4",
      line: "rgba(224,168,153,0.30)",
    },
  },
  {
    id: "emerald",
    label: "Emerald",
    palette: {
      ...BRAND.palette,
      gold: "#8FD4A8",
      goldSoft: "#C3ECD4",
      line: "rgba(143,212,168,0.28)",
    },
  },
];

export const FONT_SCALES: ReadonlyArray<{ id: string; label: string; scale: number }> = [
  { id: "sm", label: "ก", scale: 0.9 },
  { id: "md", label: "ก", scale: 1 },
  { id: "lg", label: "ก", scale: 1.15 },
];

/** Written onto the root element so plain CSS can read the brand. */
export function paletteToCssVars(
  palette: BrandPalette,
  typography: BrandTypography,
): Record<string, string> {
  return {
    "--brand-bg": palette.background,
    "--brand-gold": palette.gold,
    "--brand-gold-soft": palette.goldSoft,
    "--brand-text": palette.text,
    "--brand-text-muted": palette.textMuted,
    "--brand-line": palette.line,
    "--brand-danger": palette.danger,
    "--brand-success": palette.success,
    "--brand-font-display": typography.display,
    "--brand-font-body": typography.body,
    "--brand-scale": String(typography.scale),
  };
}
