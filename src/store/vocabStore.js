import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useVocabStore = create(
  persist(
    (set) => ({
      vocabList: [],
      addVocab: (word, definition, context) => 
        set((state) => {
          if (state.vocabList.some(v => v.word.toLowerCase() === word.toLowerCase())) {
            return state; // Already exists
          }
          return {
            vocabList: [
              { id: Date.now(), word, definition, context, addedAt: new Date().toISOString() },
              ...state.vocabList
            ]
          };
        }),
      removeVocab: (id) => 
        set((state) => ({
          vocabList: state.vocabList.filter(v => v.id !== id)
        })),
    }),
    {
      name: 'echo-english-vocab',
    }
  )
);
