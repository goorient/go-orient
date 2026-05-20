import { create } from 'zustand'

interface UIState {
  mobileNavOpen: boolean
  sidebarOpen: boolean
  setMobileNavOpen: (open: boolean) => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  mobileNavOpen: false,
  sidebarOpen: true,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
