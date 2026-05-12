export type AppStep = "design" | "order" | "success";

export interface ProductSku {
  label: string;
  value: string;
  size: string;
  color: string;
}

export type PlacementValue = "fr" | "bk" | "lp" | "rp" | "rs" | "ls";

export interface PlacementOption {
  label: string;
  value: PlacementValue;
}

export interface TshirtColor {
  id: number;
  name: string;
  hex: string;
  skuCode: string;
  mockups: { fr: string; bk: string };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  mockupImageUrl: string;
  skus: ProductSku[];
  printTypeId: number;
  availablePlacements: PlacementOption[];
  basePrice: number;
  printAreaPercent: { x: number; y: number; width: number; height: number };
  printAreaInches: { width: number; height: number };
  colorOptions?: TshirtColor[];
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  address1: string;
  address2?: string;
  phone: string;
  email: string;
  city: string;
  zip: string;
  province: string;
  country_code: string;
}

export interface QikinkDesign {
  design_code: string;
  width_inches: string;
  height_inches: string;
  placement_sku: PlacementValue;
  design_link: string;
  mockup_link: string;
}

export interface QikinkLineItem {
  search_from_my_products: 0;
  quantity: string;
  print_type_id: number;
  price: string;
  sku: string;
  designs: QikinkDesign[];
}

export interface QikinkOrderPayload {
  order_number: string;
  qikink_shipping: "1";
  gateway: "COD" | "Prepaid";
  total_order_value: string;
  line_items: QikinkLineItem[];
  shipping_address: ShippingAddress;
}
