"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

const STORAGE_KEY = "qikink-designs";

interface PersistedState {
  pastDesigns: string[];
  generatedImageUrl: string | null;
  noBgImageUrl: string | null;
}

function loadFromStorage(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function saveToStorage(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded — trim one design and retry
    try {
      const existing = loadFromStorage();
      if (existing && existing.pastDesigns.length > 1) {
        existing.pastDesigns.pop();
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, pastDesigns: existing.pastDesigns }));
      }
    } catch { /* give up silently */ }
  }
}

export function useDesignPersistence() {
  const { pastDesigns, generatedImageUrl, noBgImageUrl, setPastDesigns, setGeneratedImage, setNoBgImage } =
    useAppStore();
  const hydrated = useRef(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const saved = loadFromStorage();
    if (!saved) return;
    if (saved.pastDesigns?.length) setPastDesigns(saved.pastDesigns);
    if (saved.generatedImageUrl) setGeneratedImage(saved.generatedImageUrl);
    if (saved.noBgImageUrl) setNoBgImage(saved.noBgImageUrl);
  }, [setPastDesigns, setGeneratedImage, setNoBgImage]);

  // Persist whenever these values change (after hydration)
  useEffect(() => {
    if (!hydrated.current) return;
    saveToStorage({ pastDesigns, generatedImageUrl, noBgImageUrl });
  }, [pastDesigns, generatedImageUrl, noBgImageUrl]);
}
