"use client";

import { create } from "zustand";
import { AppStep, Product, ProductSku, PlacementOption, TshirtColor, ShippingAddress } from "@/types";
import { PRODUCTS } from "@/lib/catalog";

interface AppState {
  currentStep: AppStep;
  isGenerating: boolean;
  generatedImageUrl: string | null;
  noBgImageUrl: string | null;
  bgRemovedImageUrl: string | null; // clean PNG (no watermark) used as Qikink design_link
  pastDesigns: string[];
  referenceImageUrls: string[];
  selectedProduct: Product;
  selectedSku: ProductSku;
  selectedPlacement: PlacementOption;
  selectedColor: TshirtColor | null;
  canvasDataUrl: string | null;
  designDataUrl: string | null;
  designUrl: string | null;
  mockupUrl: string | null;
  designDimensions: { widthInches: number; heightInches: number } | null;
  shippingAddress: ShippingAddress | null;
  orderResult: { orderId: number; orderNumber: string } | null;
  error: string | null;

  setStep: (step: AppStep) => void;
  setGenerating: (v: boolean) => void;
  setGeneratedImage: (url: string) => void;
  setNoBgImage: (url: string | null) => void;
  setBgRemovedImage: (url: string | null) => void;
  addPastDesign: (url: string) => void;
  setPastDesigns: (designs: string[]) => void;
  addReferenceImage: (url: string) => void;
  removeReferenceImage: (index: number) => void;
  setProduct: (p: Product) => void;
  setSku: (s: ProductSku) => void;
  setPlacement: (p: PlacementOption) => void;
  setColor: (c: TshirtColor) => void;
  setCanvasDataUrl: (url: string | null) => void;
  setDesignDataUrl: (url: string | null) => void;
  setDesignUrl: (url: string | null) => void;
  setMockupUrl: (url: string | null) => void;
  setDesignDimensions: (d: { widthInches: number; heightInches: number } | null) => void;
  setShippingAddress: (addr: ShippingAddress) => void;
  setOrderResult: (r: { orderId: number; orderNumber: string }) => void;
  setError: (msg: string | null) => void;
  resetDesign: () => void;
}

const defaultProduct = PRODUCTS[0];
const defaultSku = defaultProduct.skus[0];
const defaultPlacement = defaultProduct.availablePlacements[0];
const defaultColor = defaultProduct.colorOptions?.[0] ?? null;

export const useAppStore = create<AppState>((set) => ({
  currentStep: "design",
  isGenerating: false,
  generatedImageUrl: null,
  noBgImageUrl: null,
  bgRemovedImageUrl: null,
  pastDesigns: [],
  referenceImageUrls: [],
  selectedProduct: defaultProduct,
  selectedSku: defaultSku,
  selectedPlacement: defaultPlacement,
  selectedColor: defaultColor,
  canvasDataUrl: null,
  designDataUrl: null,
  designUrl: null,
  mockupUrl: null,
  designDimensions: null,
  shippingAddress: null,
  orderResult: null,
  error: null,

  setStep: (step) => set({ currentStep: step }),
  setGenerating: (v) => set({ isGenerating: v }),
  setGeneratedImage: (url) => set({ generatedImageUrl: url }),
  setNoBgImage: (url) => set({ noBgImageUrl: url }),
  setBgRemovedImage: (url) => set({ bgRemovedImageUrl: url }),
  addPastDesign: (url) => set((s) => ({ pastDesigns: [url, ...s.pastDesigns].slice(0, 5) })),
  setPastDesigns: (designs) => set({ pastDesigns: designs }),
  addReferenceImage: (url) => set((s) => ({ referenceImageUrls: [...s.referenceImageUrls, url].slice(0, 3) })),
  removeReferenceImage: (index) => set((s) => ({ referenceImageUrls: s.referenceImageUrls.filter((_, i) => i !== index) })),

  setProduct: (p) =>
    set({
      selectedProduct: p,
      selectedSku: p.skus[0],
      selectedPlacement: p.availablePlacements[0],
      selectedColor: p.colorOptions?.[0] ?? null,
    }),

  setSku: (s) => set({ selectedSku: s }),
  setPlacement: (p) => set({ selectedPlacement: p }),

  setColor: (c) =>
    set((state) => {
      const size = state.selectedSku.size;
      const matchingSku = state.selectedProduct.skus.find(
        (s) => s.color === c.name && s.size === size
      ) ?? state.selectedProduct.skus.find((s) => s.color === c.name);
      return {
        selectedColor: c,
        ...(matchingSku ? { selectedSku: matchingSku } : {}),
      };
    }),

  setCanvasDataUrl: (url) => set({ canvasDataUrl: url }),
  setDesignDataUrl: (url) => set({ designDataUrl: url }),
  setDesignUrl: (url) => set({ designUrl: url }),
  setMockupUrl: (url) => set({ mockupUrl: url }),
  setDesignDimensions: (d) => set({ designDimensions: d }),
  setShippingAddress: (addr) => set({ shippingAddress: addr }),
  setOrderResult: (r) => set({ orderResult: r }),
  setError: (msg) => set({ error: msg }),

  resetDesign: () =>
    set({
      generatedImageUrl: null,
      noBgImageUrl: null,
      bgRemovedImageUrl: null,
      canvasDataUrl: null,
      designDataUrl: null,
      designUrl: null,
      mockupUrl: null,
      designDimensions: null,
      currentStep: "design",
      error: null,
    }),
}));
