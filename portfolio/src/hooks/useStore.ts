import { create } from 'zustand';

type ViewState = 'idle' | 'monitor' | 'notebook' | 'toolbox' | 'walkieTalkie';

interface AppState {
  currentView: ViewState;
  isBooting: boolean;
  setBooting: (status: boolean) => void;
  setView: (view: ViewState) => void;
  resetView: () => void;
}

export const useStore = create<AppState>((set) => ({
  currentView: 'idle',
  isBooting: true,
  setBooting: (status) => set({ isBooting: status }),
  setView: (view) => set({ currentView: view }),
  resetView: () => set({ currentView: 'idle' }),
}));
