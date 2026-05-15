"use client";

import { useAppStore } from "@/store/useAppStore";

interface Props {
  onSelect: (url: string) => void;
  selectedUrl: string | null;
}

export function ImageGallery({ onSelect, selectedUrl }: Props) {
  const images = useAppStore((s) => s.pastDesigns);

  if (images.length === 0) {
    return (
      <p className="text-xs text-gray-600 text-center py-3">
        No generated images yet
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
      {images.map((url, i) => (
        <button
          key={i}
          onClick={() => onSelect(url)}
          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
            selectedUrl === url
              ? "border-indigo-500 ring-1 ring-indigo-500"
              : "border-gray-700 hover:border-gray-500"
          }`}
        >
          <img
            src={url}
            alt="Generated design"
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget.closest("button") as HTMLElement).style.display = "none"; }}
          />
        </button>
      ))}
    </div>
  );
}
