import { Product, TshirtColor } from "@/types";

export const TSHIRT_COLORS: TshirtColor[] = [
  { id: 1,  name: "White",        hex: "#EDF2F7", skuCode: "Wh", mockups: { fr: "/mockups/tshirt/Front_1_c_1.jpg",  bk: "/mockups/tshirt/Back_2_c_1.jpg"  } },
  { id: 2,  name: "Black",        hex: "#1A1A1A", skuCode: "Bk", mockups: { fr: "/mockups/tshirt/Front_1_c_2.jpg",  bk: "/mockups/tshirt/Back_2_c_2.jpg"  } },
  { id: 3,  name: "Navy",         hex: "#1B2A4A", skuCode: "Nv", mockups: { fr: "/mockups/tshirt/Front_1_c_3.jpg",  bk: "/mockups/tshirt/Back_2_c_3.jpg"  } },
  { id: 8,  name: "Bottle Green", hex: "#1F5C34", skuCode: "BG", mockups: { fr: "/mockups/tshirt/Front_1_c_8.jpg",  bk: "/mockups/tshirt/Back_2_c_8.jpg"  } },
  { id: 10, name: "Maroon",       hex: "#7B1D1D", skuCode: "Mr", mockups: { fr: "/mockups/tshirt/Front_1_c_10.jpg", bk: "/mockups/tshirt/Back_2_c_10.jpg" } },
  { id: 25, name: "Wine",         hex: "#5C1A2E", skuCode: "Wn", mockups: { fr: "/mockups/tshirt/Front_1_c_25.jpg", bk: "/mockups/tshirt/Back_2_c_25.jpg" } },
  { id: 45, name: "Baby Pink",    hex: "#E8B4C8", skuCode: "BP", mockups: { fr: "/mockups/tshirt/Front_1_c_45.jpg", bk: "/mockups/tshirt/Back_2_c_45.jpg" } },
  { id: 49, name: "Lavender",     hex: "#C4B5E8", skuCode: "Lv", mockups: { fr: "/mockups/tshirt/Front_1_c_49.jpg", bk: "/mockups/tshirt/Back_2_c_49.jpg" } },
  { id: 54, name: "Sky Blue",     hex: "#87CEEB", skuCode: "SB", mockups: { fr: "/mockups/tshirt/Front_1_c_54.jpg", bk: "/mockups/tshirt/Back_2_c_54.jpg" } },
  { id: 56, name: "Mauve",        hex: "#C48080", skuCode: "Mv", mockups: { fr: "/mockups/tshirt/Front_1_c_56.jpg", bk: "/mockups/tshirt/Back_2_c_56.jpg" } },
  { id: 57, name: "Sage Green",   hex: "#8DB89A", skuCode: "SG", mockups: { fr: "/mockups/tshirt/Front_1_c_57.jpg", bk: "/mockups/tshirt/Back_2_c_57.jpg" } },
  { id: 61, name: "Cream",        hex: "#F5F0E0", skuCode: "Cr", mockups: { fr: "/mockups/tshirt/Front_1_c_61.jpg", bk: "/mockups/tshirt/Back_2_c_61.jpg" } },
];

const SIZES = ["S", "M", "L", "XL"] as const;

// SKU codes must match Qikink's catalog exactly (dashboard.qikink.com → Products → SKU Descriptions)
// Color code mapping for the Men's V-neck Henley Oversized (MVnHs) product
const QIKINK_COLOR_CODE: Record<string, string> = {
  Wh: "Wh",
  Bk: "Bk",
  Nv: "Nv",
  BG: "BG",
  Mr: "Mr",
  Wn: "Wn",
  BP: "BP",
  Lv: "Lv",
  SB: "SB",
  Mv: "Mv",
  SG: "SG",
  Cr: "Cr",
};

function buildTshirtSkus() {
  return TSHIRT_COLORS.flatMap((c) =>
    SIZES.map((size) => ({
      label: `${c.name} / ${size}`,
      value: `MVnHs-${QIKINK_COLOR_CODE[c.skuCode] ?? c.skuCode}-${size}`,
      size,
      color: c.name,
    }))
  );
}

export const PRODUCTS: Product[] = [
  {
    id: "tshirt-oversized",
    name: "Oversized T-Shirt",
    description: "Premium 240gsm oversized boxy tee, DTG printed",
    mockupImageUrl: "/mockups/tshirt/Front_1_c_1.jpg",
    printTypeId: 2,
    basePrice: 549,
    colorOptions: TSHIRT_COLORS,
    availablePlacements: [
      { label: "Front", value: "fr" },
      { label: "Back", value: "bk" },
    ],
    printAreaPercent: { x: 0.27, y: 0.20, width: 0.46, height: 0.40 },
    printAreaInches: { width: 12, height: 14 },
    skus: buildTshirtSkus(),
  },
];
