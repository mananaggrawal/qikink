"use client";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useAppStore } from "@/store/useAppStore";

interface Props {
  onFlipH: () => void;
  onFlipV: () => void;
  onRotate: () => void;
  onReset: () => void;
  hasDesign: boolean;
}

export function EditorToolbar({
  onFlipH,
  onFlipV,
  onRotate,
  onReset,
  hasDesign,
}: Props) {
  const { selectedProduct, selectedSku, selectedColor, selectedPlacement, setSku, setPlacement } =
    useAppStore();

  const hasColors = !!selectedProduct.colorOptions?.length;

  // For color products, show only sizes for the selected color
  const sizeOptions = hasColors
    ? selectedProduct.skus
        .filter((s) => s.color === selectedColor?.name)
        .map((s) => ({ label: s.size, value: s.value }))
    : selectedProduct.skus.map((s) => ({ label: s.label, value: s.value }));

  return (
    <div className="flex flex-col gap-3">
      {hasColors ? (
        <Select
          label="Size"
          value={selectedSku.value}
          onChange={(e) => {
            const sku = selectedProduct.skus.find((s) => s.value === e.target.value);
            if (sku) setSku(sku);
          }}
          options={sizeOptions}
        />
      ) : (
        <Select
          label="SKU / Variant"
          value={selectedSku.value}
          onChange={(e) => {
            const sku = selectedProduct.skus.find((s) => s.value === e.target.value);
            if (sku) setSku(sku);
          }}
          options={sizeOptions}
        />
      )}

      <Select
        label="Placement"
        value={selectedPlacement.value}
        onChange={(e) => {
          const p = selectedProduct.availablePlacements.find((pl) => pl.value === e.target.value);
          if (p) setPlacement(p);
        }}
        options={selectedProduct.availablePlacements.map((p) => ({
          label: p.label,
          value: p.value,
        }))}
      />

      <div className="border-t border-gray-800 pt-3">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">Design Tools</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" onClick={onFlipH} disabled={!hasDesign}>
            Flip ↔
          </Button>
          <Button variant="secondary" size="sm" onClick={onFlipV} disabled={!hasDesign}>
            Flip ↕
          </Button>
          <Button variant="secondary" size="sm" onClick={onRotate} disabled={!hasDesign}>
            Rotate 90°
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={!hasDesign}
          className="w-full mt-2"
        >
          Reset Position
        </Button>
      </div>
    </div>
  );
}
