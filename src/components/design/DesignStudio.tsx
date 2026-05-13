"use client";

import { useRef, useState, useCallback } from "react";
import { useMockupEditor } from "@/hooks/useMockupEditor";
import { useAppStore } from "@/store/useAppStore";
import { useDesignPersistence } from "@/hooks/useDesignPersistence";
import { ProductSelector } from "@/components/editor/ProductSelector";
import { ColorSelector } from "@/components/editor/ColorSelector";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { ImageGallery } from "@/components/design/ImageGallery";
import { Button } from "@/components/ui/Button";

const CANVAS_SIZE = 560;

type ActiveOp = "idle" | "generating" | "uploading" | "removing-bg" | "vectorizing";

export function DesignStudio() {
  useDesignPersistence();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [activeOp, setActiveOp] = useState<ActiveOp>("idle");
  // Holds the local data URL for an uploaded file so we can preview it
  // before the Cloudinary upload completes (not stored in Zustand).
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const {
    generatedImageUrl,
    noBgImageUrl,
    isGenerating,
    setGenerating,
    setGeneratedImage,
    setNoBgImage,
    addPastDesign,
    setStep,
    setDesignUrl,
    setMockupUrl,
    setError,
    error,
  } = useAppStore();

  const {
    isReady,
    hasDesign,
    loadDesignImage,
    flipDesign,
    rotateDesign,
    resetDesignTransform,
    exportCanvas,
  } = useMockupEditor(canvasRef);

  // ─── API calls ───────────────────────────────────────────────────────────

  const apiPost = useCallback(async (path: string, body: object): Promise<string> => {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.url as string;
  }, []);

  // ─── Actions ─────────────────────────────────────────────────────────────

  const generateImage = useCallback(async () => {
    if (!prompt.trim() || activeOp !== "idle") return;
    setActiveOp("generating");
    setGenerating(true);
    setNoBgImage(null);
    setLocalPreviewUrl(null);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
      setActiveOp("idle");
    }
  }, [prompt, activeOp, setGenerating, setGeneratedImage, setNoBgImage, setLocalPreviewUrl, setError]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        if (!dataUrl) return;
        setLocalPreviewUrl(dataUrl);
        setNoBgImage(null);
        setError(null);
        setActiveOp("uploading");
        try {
          const url = await apiPost("/api/upload-design", { dataUrl, filename: `upload-${Date.now()}` });
          setGeneratedImage(url);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
          setLocalPreviewUrl(null);
          setActiveOp("idle");
        }
      };
      reader.readAsDataURL(file);
    },
    [apiPost, setGeneratedImage, setNoBgImage, setError]
  );

  const handleRemoveBg = useCallback(async () => {
    const source = noBgImageUrl ?? generatedImageUrl;
    if (!source || activeOp !== "idle") return;
    setActiveOp("removing-bg");
    setError(null);
    try {
      const url = await apiPost("/api/remove-bg", { imageUrl: source });
      setNoBgImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Background removal failed");
    } finally {
      setActiveOp("idle");
    }
  }, [noBgImageUrl, generatedImageUrl, activeOp, apiPost, setNoBgImage, setError]);

  const handleVectorize = useCallback(async () => {
    const source = noBgImageUrl ?? generatedImageUrl;
    if (!source || activeOp !== "idle") return;
    setActiveOp("vectorizing");
    setError(null);
    try {
      const url = await apiPost("/api/vectorize", { imageUrl: source });
      setNoBgImage(url);
      addPastDesign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vectorization failed");
    } finally {
      setActiveOp("idle");
    }
  }, [noBgImageUrl, generatedImageUrl, activeOp, apiPost, setNoBgImage, addPastDesign, setError]);

  const handleAddToMockup = useCallback(() => {
    const url = noBgImageUrl ?? generatedImageUrl ?? localPreviewUrl;
    if (url) loadDesignImage(url);
  }, [noBgImageUrl, generatedImageUrl, localPreviewUrl, loadDesignImage]);

  const handleProceed = async () => {
    setIsExporting(true);
    try {
      const result = await exportCanvas();
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

  // ─── Derived state ───────────────────────────────────────────────────────

  const displayUrl = noBgImageUrl ?? generatedImageUrl ?? localPreviewUrl;
  const isBusy = activeOp !== "idle";

  const overlayLabel: Record<ActiveOp, string> = {
    idle: "",
    generating: "Generating with Imagen 4...",
    uploading: "Uploading...",
    "removing-bg": "Removing background...",
    vectorizing: "Vectorizing to SVG...",
  };

  const showImageUnderOverlay = displayUrl && activeOp !== "generating" && activeOp !== "uploading";

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
      {/* LEFT: Controls */}
      <div className="lg:w-72 flex-shrink-0 flex flex-col gap-5 overflow-y-auto pb-4">
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
            disabled={!prompt.trim() || isBusy}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Design"}
          </Button>
        </div>

        {/* Upload */}
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
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Image
          </Button>
        </div>

        {/* Current design preview */}
        {(isBusy || displayUrl) && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              Current Design
            </p>
            <div className="relative rounded-xl overflow-hidden border border-gray-700 bg-gray-900 aspect-square">
              {/* Image visible under the overlay during bg removal / vectorization */}
              {showImageUnderOverlay && (
                <img src={displayUrl} alt="Design" className="w-full h-full object-contain" />
              )}

              {/* Overlay — full-cover for generation (no image yet), semi for later stages */}
              {isBusy && (
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center gap-3 ${
                    showImageUnderOverlay ? "bg-gray-900/75" : "bg-gray-900"
                  }`}
                >
                  <div className="animate-spin w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full" />
                  <p className="text-xs text-gray-300 text-center px-4">{overlayLabel[activeOp]}</p>
                </div>
              )}
            </div>

            {!isBusy && displayUrl && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    onClick={handleRemoveBg}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    disabled={isBusy}
                  >
                    Remove BG
                  </Button>
                  <Button
                    onClick={handleVectorize}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    disabled={isBusy}
                  >
                    Vectorize
                  </Button>
                </div>
                <Button onClick={handleAddToMockup} size="sm" className="w-full">
                  Place on Mockup →
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Past designs */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
            Past Designs
          </p>
          <ImageGallery
            selectedUrl={displayUrl}
            onSelect={(url) => {
              setGeneratedImage(url);
              setNoBgImage(null);
              setLocalPreviewUrl(null);
            }}
          />
        </div>

        {/* Design tools */}
        {hasDesign && (
          <EditorToolbar
            onFlipH={() => flipDesign("horizontal")}
            onFlipV={() => flipDesign("vertical")}
            onRotate={() => rotateDesign(90)}
            onReset={resetDesignTransform}
            hasDesign={hasDesign}
          />
        )}

        {error && (
          <p className="text-xs text-red-400 bg-red-900/30 p-2 rounded-lg border border-red-800">
            {error}
          </p>
        )}
      </div>

      {/* RIGHT: Canvas */}
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
