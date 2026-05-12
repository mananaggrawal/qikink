"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { Canvas, FabricImage } from "fabric";

const CANVAS_SIZE = 560;

export function useMockupEditor(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const fabricRef = useRef<Canvas | null>(null);
  const designRef = useRef<FabricImage | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [hasDesign, setHasDesign] = useState(false);

  const {
    generatedImageUrl,
    noBgImageUrl,
    selectedProduct,
    selectedColor,
    selectedPlacement,
    setCanvasDataUrl,
    setDesignDataUrl,
    setDesignDimensions,
    setNoBgImage,
    setError,
  } = useAppStore();

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    let canvas: Canvas;
    let disposed = false;

    (async () => {
      const { Canvas: FabricCanvas } = await import("fabric");
      if (disposed || fabricRef.current) return;
      canvas = new FabricCanvas(canvasRef.current!, {
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        backgroundColor: "#f8f8f8",
        selection: true,
      });
      fabricRef.current = canvas;
      setIsReady(true);
    })();

    return () => {
      disposed = true;
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
        setIsReady(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve mockup URL based on color + placement, falling back to product default
  const getMockupUrl = useCallback(() => {
    if (selectedProduct.colorOptions && selectedColor) {
      const placement = selectedPlacement.value as "fr" | "bk";
      return selectedColor.mockups[placement] ?? selectedColor.mockups.fr;
    }
    return selectedProduct.mockupImageUrl;
  }, [selectedProduct, selectedColor, selectedPlacement]);

  // Load mockup background when product, color, or placement changes
  const loadBackground = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas || !selectedProduct) return;

    const { FabricImage: FImg } = await import("fabric");

    try {
      const bg = await FImg.fromURL(getMockupUrl(), { crossOrigin: "anonymous" });
      // "cover": scale up until both dimensions fill the canvas, then center
      const imgW = bg.width ?? CANVAS_SIZE;
      const imgH = bg.height ?? CANVAS_SIZE;
      const scale = Math.max(CANVAS_SIZE / imgW, CANVAS_SIZE / imgH);
      bg.set({
        scaleX: scale,
        scaleY: scale,
        left: (CANVAS_SIZE - imgW * scale) / 2,
        top: (CANVAS_SIZE - imgH * scale) / 2,
        originX: "left",
        originY: "top",
        selectable: false,
        evented: false,
      });
      canvas.backgroundImage = bg;
      canvas.renderAll();
    } catch {
      canvas.backgroundColor = "#f0f0f0";
      canvas.renderAll();
    }
  }, [selectedProduct, getMockupUrl]);

  useEffect(() => {
    if (isReady) loadBackground();
  }, [isReady, loadBackground]);

  // Load design image onto canvas (called manually by user)
  const loadDesignImage = useCallback(
    async (url: string) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const { FabricImage: FImg } = await import("fabric");

      if (designRef.current) {
        canvas.remove(designRef.current);
        designRef.current = null;
      }

      try {
        const img = await FImg.fromURL(url, { crossOrigin: "anonymous" });

        const { x, y, width, height } = selectedProduct.printAreaPercent;
        const printX = x * CANVAS_SIZE;
        const printY = y * CANVAS_SIZE;
        const printW = width * CANVAS_SIZE;
        const printH = height * CANVAS_SIZE;

        const maxDim = Math.min(printW, printH);
        const scale = maxDim / Math.max(img.width ?? 1, img.height ?? 1);

        img.set({
          left: printX + printW / 2,
          top: printY + printH / 2,
          originX: "center",
          originY: "center",
          scaleX: scale,
          scaleY: scale,
          cornerColor: "#6366f1",
          cornerStyle: "circle",
          borderColor: "#6366f1",
          transparentCorners: false,
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        designRef.current = img;
        setHasDesign(true);
      } catch {
        setError("Failed to load design image");
      }
    },
    [selectedProduct, setError]
  );

  const removeBackground = useCallback(async () => {
    const url = generatedImageUrl;
    if (!url) return;

    setIsRemovingBg(true);
    setError(null);

    try {
      const res = await fetch("/api/remove-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNoBgImage(data.dataUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Background removal failed";
      setError(msg);
    } finally {
      setIsRemovingBg(false);
    }
  }, [generatedImageUrl, setNoBgImage, setError]);

  const flipDesign = useCallback((direction: "horizontal" | "vertical") => {
    const obj = designRef.current;
    if (!obj) return;
    if (direction === "horizontal") obj.set("flipX", !obj.flipX);
    else obj.set("flipY", !obj.flipY);
    fabricRef.current?.renderAll();
  }, []);

  const rotateDesign = useCallback((degrees: number) => {
    const obj = designRef.current;
    if (!obj) return;
    obj.set("angle", ((obj.angle ?? 0) + degrees) % 360);
    fabricRef.current?.renderAll();
  }, []);

  const resetDesignTransform = useCallback(() => {
    const obj = designRef.current;
    if (!obj || !selectedProduct) return;

    const { x, y, width, height } = selectedProduct.printAreaPercent;
    const printW = width * CANVAS_SIZE;
    const printH = height * CANVAS_SIZE;
    const maxDim = Math.min(printW, printH);
    const scale = maxDim / Math.max(obj.width ?? 1, obj.height ?? 1);

    obj.set({
      left: x * CANVAS_SIZE + printW / 2,
      top: y * CANVAS_SIZE + printH / 2,
      scaleX: scale,
      scaleY: scale,
      angle: 0,
      flipX: false,
      flipY: false,
    });
    fabricRef.current?.renderAll();
  }, [selectedProduct]);

  // Transparent 1×1 PNG used as a placeholder design_link for blank products
  const BLANK_DESIGN_DATA_URL =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQ" +
    "AABjkB6QAAAABJRU5ErkJggg==";

  const exportCanvas = useCallback(async (): Promise<{
    mockupDataUrl: string;
    designDataUrl: string;
  }> => {
    const canvas = fabricRef.current!;
    const design = designRef.current;

    const mockupDataUrl = canvas.toDataURL({ format: "png", multiplier: 2 });

    if (!design) {
      setCanvasDataUrl(mockupDataUrl);
      setDesignDataUrl(BLANK_DESIGN_DATA_URL);
      setDesignDimensions(null);
      return { mockupDataUrl, designDataUrl: BLANK_DESIGN_DATA_URL };
    }

    const designDataUrl = design.toDataURL({ format: "png", multiplier: 2 });

    // Calculate design dimensions in inches based on its size relative to the print area
    const printAreaWidthPx = selectedProduct.printAreaPercent.width * CANVAS_SIZE;
    const printAreaHeightPx = selectedProduct.printAreaPercent.height * CANVAS_SIZE;
    const { width: printAreaWidthIn, height: printAreaHeightIn } = selectedProduct.printAreaInches;
    const designWidthPx = (design.width ?? 0) * (design.scaleX ?? 1);
    const designHeightPx = (design.height ?? 0) * (design.scaleY ?? 1);
    const widthInches = parseFloat(((designWidthPx / printAreaWidthPx) * printAreaWidthIn).toFixed(2));
    const heightInches = parseFloat(((designHeightPx / printAreaHeightPx) * printAreaHeightIn).toFixed(2));

    setCanvasDataUrl(mockupDataUrl);
    setDesignDataUrl(designDataUrl);
    setDesignDimensions({ widthInches, heightInches });

    return { mockupDataUrl, designDataUrl };
  }, [selectedProduct, setCanvasDataUrl, setDesignDataUrl, setDesignDimensions]);

  // When noBgImageUrl updates and a design is already on canvas, reload it
  useEffect(() => {
    if (noBgImageUrl && designRef.current) {
      loadDesignImage(noBgImageUrl);
    }
  }, [noBgImageUrl, loadDesignImage]);

  return {
    isReady,
    isRemovingBg,
    hasDesign,
    loadDesignImage,
    removeBackground,
    flipDesign,
    rotateDesign,
    resetDesignTransform,
    exportCanvas,
  };
}
