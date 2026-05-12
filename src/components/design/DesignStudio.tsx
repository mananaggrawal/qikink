"use client";

import { useRef, useState, useCallback } from "react";
import { useMockupEditor } from "@/hooks/useMockupEditor";
import { useAppStore } from "@/store/useAppStore";
import { ProductSelector } from "@/components/editor/ProductSelector";
import { ColorSelector } from "@/components/editor/ColorSelector";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { ImageGallery } from "@/components/design/ImageGallery";
import { Button } from "@/components/ui/Button";

const CANVAS_SIZE = 560;

export function DesignStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const {
    generatedImageUrl,
    noBgImageUrl,
    isGenerating,
    setGenerating,
    setGeneratedImage,
    addPastDesign,
    setStep,
    setDesignUrl,
    setMockupUrl,
    setError,
    error,
  } = useAppStore();

  const {
    isReady,
    isRemovingBg,
    hasDesign,
    loadDesignImage,
    removeBackground,
    flipDesign,
    rotateDesign,
    resetDesignTransform,
    exportCanvas,
  } = useMockupEditor(canvasRef);

  const generateImage = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedImage(data.imageUrl);
      addPastDesign(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }, [prompt, isGenerating, setGenerating, setGeneratedImage, setError]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        if (url) {
          setGeneratedImage(url);
        }
      };
      reader.readAsDataURL(file);
    },
    [setGeneratedImage]
  );

  const handleAddToMockup = useCallback(() => {
    const url = noBgImageUrl ?? generatedImageUrl;
    if (url) loadDesignImage(url);
  }, [noBgImageUrl, generatedImageUrl, loadDesignImage]);

  const handleProceed = async () => {
    setIsExporting(true);
    try {
      const result = await exportCanvas();

      const [designRes, mockupRes] = await Promise.all([
        fetch("/api/upload-design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl: result.designDataUrl, filename: `design-${Date.now()}` }),
        }),
        fetch("/api/upload-design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl: result.mockupDataUrl, filename: `mockup-${Date.now()}` }),
        }),
      ]);

      const [designData, mockupData] = await Promise.all([designRes.json(), mockupRes.json()]);
      if (designData.error || mockupData.error) throw new Error(designData.error ?? mockupData.error);

      setDesignUrl(designData.url);
      setMockupUrl(mockupData.url);
      setStep("order");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const displayUrl = noBgImageUrl ?? generatedImageUrl;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
      {/* LEFT: Controls */}
      <div className="lg:w-72 flex-shrink-0 flex flex-col gap-5 overflow-y-auto pb-4">
        {/* Product selector */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Product</p>
          <ProductSelector />
        </div>

        <ColorSelector />

        {/* AI prompt */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            AI Design Generator
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                generateImage();
              }
            }}
            placeholder="e.g. A vintage sun with rays, retro style, minimal..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={3}
          />
          <Button
            onClick={generateImage}
            loading={isGenerating}
            disabled={!prompt.trim()}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Design"}
          </Button>
        </div>

        {/* Upload own image */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
            Upload Your Own
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Image
          </Button>
        </div>

        {/* Current design preview */}
        {(isGenerating || displayUrl) && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              Current Design
            </p>
            <div className="relative rounded-xl overflow-hidden border border-gray-700 bg-gray-900 aspect-square">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                  <p className="text-xs text-gray-500">Generating with Gemini...</p>
                </div>
              ) : displayUrl ? (
                <img src={displayUrl} alt="Design" className="w-full h-full object-contain" />
              ) : null}
            </div>

            {!isGenerating && displayUrl && (
              <div className="flex flex-col gap-2">
                <Button onClick={handleAddToMockup} size="sm" className="w-full">
                  Place on Mockup →
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={removeBackground}
                  loading={isRemovingBg}
                  disabled={!generatedImageUrl || generatedImageUrl.startsWith("data:")}
                  className="w-full"
                >
                  {noBgImageUrl ? "BG Removed ✓" : "Remove Background"}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Past images gallery */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
            Past Designs
          </p>
          <ImageGallery
            selectedUrl={generatedImageUrl}
            onSelect={(url) => {
              setGeneratedImage(url);
            }}
          />
        </div>

        {/* Design tools */}
        {hasDesign && (
          <EditorToolbar
            onRemoveBg={removeBackground}
            onFlipH={() => flipDesign("horizontal")}
            onFlipV={() => flipDesign("vertical")}
            onRotate={() => rotateDesign(90)}
            onReset={resetDesignTransform}
            isRemovingBg={isRemovingBg}
            hasDesign={hasDesign}
          />
        )}

        {error && (
          <p className="text-xs text-red-400 bg-red-900/30 p-2 rounded-lg border border-red-800">
            {error}
          </p>
        )}
      </div>

      {/* RIGHT: Mockup Canvas */}
      <div className="flex-1 flex flex-col items-center gap-4">
        <div className="relative" style={{ width: CANVAS_SIZE, maxWidth: "100%" }}>
          {!isReady && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-xl z-10"
              style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            >
              <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="rounded-xl border border-gray-700 shadow-xl max-w-full"
            style={{ touchAction: "none" }}
          />
        </div>

        {!hasDesign && isReady && (
          <p className="text-sm text-gray-600 text-center">
            Generate or upload a design, then click "Place on Mockup" — or proceed blank
          </p>
        )}

        <div className="flex gap-3">
          {hasDesign ? (
            <Button size="lg" onClick={handleProceed} loading={isExporting}>
              Proceed to Order →
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              onClick={handleProceed}
              loading={isExporting}
              disabled={!isReady}
            >
              Proceed without Design →
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-600 text-center max-w-md">
          Drag, resize, and rotate your design on the product mockup.
        </p>
      </div>
    </div>
  );
}
