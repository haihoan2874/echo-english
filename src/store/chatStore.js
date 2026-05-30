import { create } from 'zustand';

export const useChatStore = create((set) => ({
  hasStarted: false,
  messages: [],
  level: 'Beginner (A1)',
  
  // Setters
  setHasStarted: (status) => set({ hasStarted: status }),
  setLevel: (level) => set({ level }),
  setMessages: (updater) => set((state) => ({ 
    messages: typeof updater === 'function' ? updater(state.messages) : updater 
  })),
  addMessage: (role, text) => set((state) => ({ 
    messages: [...state.messages, { role, text }] 
  })),
  clearMessages: () => set({ messages: [] }),
  resetChat: () => set({ hasStarted: false, messages: [] })
}));
