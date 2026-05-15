"use client";

import { create } from "zustand";

type CompareState = {
  selectedIds: string[];
  toggleSchool: (id: string) => void;
  clear: () => void;
};

export const useCompareStore = create<CompareState>((set) => ({
  selectedIds: [],
  toggleSchool: (id) =>
    set((state) => {
      if (state.selectedIds.includes(id)) {
        return { selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id) };
      }

      return { selectedIds: [...state.selectedIds, id].slice(-3) };
    }),
  clear: () => set({ selectedIds: [] })
}));
