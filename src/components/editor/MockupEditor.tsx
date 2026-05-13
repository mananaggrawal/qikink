"use client";

import { useRef, useState } from "react";
import { useMockupEditor } from "@/hooks/useMockupEditor";
import { useAppStore } from "@/store/useAppStore";
import { ProductSelector } from "./ProductSelector";
import { EditorToolbar } from "./EditorToolbar";
import { Button } from "@/components/ui/Button";

export function MockupEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { setStep, setDesignUrl, setMockupUrl, generatedImageUrl, noBgImageUrl, error } = useAppStore();

  const {
    isReady,
    flipDesign,
    rotateDesign,
    resetDesignTransform,
    exportCanvas,
    hasDesign,
  } = useMockupEditor(canvasRef);

  const handleProceed = async () => {
    setIsExporting(true);
    try {
      const result = await exportCanvas();
      if (!result) {
        alert("Please wait for the design to load on the canvas.");
        return;
      }

      // design_link = original full-res Cloudinary image; mockup_link = canvas composite
      const sourceDesignUrl = noBgImageUrl ?? generatedImageUrl;

      const mockupRes = await fetch("/api/upload-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: result.mockupDataUrl, filename: `mockup-${Date.now()}` }),
      });

      const mockupData = await mockupRes.json();
      if (mockupData.error) throw new Error(mockupData.error);

      setDesignUrl(sourceDesignUrl);
      setMockupUrl(mockupData.url);
      setStep("order");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
      {/* Sidebar */}
      <div className="lg:w-64 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Product</p>
          <ProductSelector />
        </div>

        <EditorToolbar
          onFlipH={() => flipDesign("horizontal")}
          onFlipV={() => flipDesign("vertical")}
          onRotate={() => rotateDesign(90)}
          onReset={resetDesignTransform}
          hasDesign={hasDesign}
        />

        {error && (
          <p className="text-xs text-red-400 bg-red-900/30 p-2 rounded-lg border border-red-800">
            {error}
          </p>
        )}
      </div>

      {/* Canvas area */}
      <div className="flex-1 flex flex-col items-center gap-4">
        <div className="relative">
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-xl z-10">
              <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="rounded-xl border border-gray-700 shadow-xl max-w-full"
            style={{ touchAction: "none" }}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setStep("design")}>
            ← Back to Design
          </Button>
          <Button
            size="lg"
            onClick={handleProceed}
            loading={isExporting}
            disabled={!hasDesign || !isReady}
          >
            Proceed to Order →
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center max-w-md">
          Drag, resize, and rotate your design on the product. Use the tools on the left to remove the background or adjust orientation.
        </p>
      </div>
    </div>
  );
}
