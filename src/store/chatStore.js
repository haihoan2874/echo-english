import { create } from 'zustand';

export const useChatStore = create((set) => ({
  hasStarted: false,
  messages: [],
  level: 'Beginner (A1)',
  scenario: null,
  
  // Setters
  setHasStarted: (status) => set({ hasStarted: status }),
  setLevel: (level) => set({ level }),
  setScenario: (scenario) => set({ scenario }),
  
  addMessage: (payload) => set((state) => ({ 
    messages: [...state.messages, payload] 
  })),
  clearMessages: () => set({ messages: [] }),
  resetChat: () => set({ hasStarted: false, messages: [], scenario: null })
}));
