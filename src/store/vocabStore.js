import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useVocabStore = create(
  persist(
    (set, get) => ({
      vocabList: [],
      // Gamification State
      xp: 0,
      level: 1,
      streak: 0,
      lastStudyDate: null,
      studyLogs: {}, // { 'YYYY-MM-DD': xpGained }
      
      // Global Settings
      settings: {
        voiceSpeed: 0.85,
      },
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      resetAllData: () => set(() => ({
        vocabList: [],
        xp: 0,
        level: 1,
        streak: 0,
        lastStudyDate: null,
        studyLogs: {},
        quests: [
          { id: 'add_vocab', title: 'Lưu 3 từ vựng mới', target: 3, current: 0, reward: 30, isClaimed: false },
          { id: 'shadowing', title: 'Phát âm đúng 5 câu', target: 5, current: 0, reward: 50, isClaimed: false },
          { id: 'gain_xp', title: 'Thu thập 100 XP', target: 100, current: 0, reward: 100, isClaimed: false },
        ]
      })),

      addVocab: (word, definition, context) => 
        set((state) => {
          if (state.vocabList.some(v => v.word.toLowerCase() === word.toLowerCase())) {
            return state; // Already exists
          }
          
          // Update quest
          const newQuests = state.quests.map(q => {
            if (q.id === 'add_vocab' && !q.isClaimed) {
              return { ...q, current: Math.min(q.current + 1, q.target) };
            }
            return q;
          });

          return {
            vocabList: [
              { 
                id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(), 
                word, 
                definition, 
                context, 
                addedAt: new Date().toISOString(),
                box: 0,
                nextReviewDate: new Date().toISOString()
              },
              ...state.vocabList
            ],
            quests: newQuests
          };
        }),
      removeVocab: (id) => 
        set((state) => ({
          vocabList: state.vocabList.filter(v => v.id !== id)
        })),

      // SRS Logic
      reviewVocab: (id, isCorrect) => set((state) => {
        const intervals = [1, 3, 7, 14, 30]; // Days to wait for box 1, 2, 3, 4, 5+
        
        const newVocabList = state.vocabList.map(v => {
          if (v.id === id) {
            let currentBox = v.box || 0;
            
            if (isCorrect) {
              currentBox = Math.min(currentBox + 1, intervals.length);
            } else {
              currentBox = 0; // Reset on failure
            }

            const nextDate = new Date();
            const daysToAdd = currentBox === 0 ? 0 : intervals[currentBox - 1];
            nextDate.setDate(nextDate.getDate() + daysToAdd);
            
            // Allow review immediately if box = 0, otherwise start of the day
            if (currentBox > 0) {
              nextDate.setHours(0, 0, 0, 0);
            }

            return {
              ...v,
              box: currentBox,
              nextReviewDate: nextDate.toISOString()
            };
          }
          return v;
        });

        return { vocabList: newVocabList };
      }),

      // Gamification Actions
      addXP: (amount) => set((state) => {
        let newXp = state.xp + amount;
        let newLevel = state.level;
        
        // Simple Leveling system: 100 XP per level progressive
        let xpRequired = newLevel * 100;
        while (newXp >= xpRequired) {
          newXp -= xpRequired;
          newLevel += 1;
          xpRequired = newLevel * 100;
        }
        
        // Update gain_xp quest
        const newQuests = state.quests.map(q => {
          if (q.id === 'gain_xp' && !q.isClaimed) {
            return { ...q, current: Math.min(q.current + amount, q.target) };
          }
          return q;
        });

        // Update studyLogs
        const todayStr = new Date().toISOString().split('T')[0];
        const newLogs = { ...state.studyLogs };
        newLogs[todayStr] = (newLogs[todayStr] || 0) + amount;

        return {
          xp: newXp,
          level: newLevel,
          quests: newQuests,
          studyLogs: newLogs
        };
      }),

      // Run this once per day/session to ensure streak increments just by opening the app
      checkLoginDaily: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        let newStreak = state.streak;
        
        if (state.lastStudyDate !== today) {
          if (state.lastStudyDate) {
            const lastDate = new Date(state.lastStudyDate);
            const currentDate = new Date(today);
            lastDate.setHours(0, 0, 0, 0);
            currentDate.setHours(0, 0, 0, 0);
            const diffTime = currentDate - lastDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (diffDays === 1) {
              newStreak += 1; 
            } else if (diffDays > 1) {
              newStreak = 1; 
            }
          } else {
            newStreak = 1; 
          }
          
          return {
            streak: newStreak,
            lastStudyDate: today
          };
        }
        return {};
      }),

      // Quests State
      lastQuestDate: null,
      quests: [
        { id: 'add_vocab', title: 'Lưu 3 từ vựng mới', target: 3, current: 0, reward: 30, isClaimed: false },
        { id: 'shadowing', title: 'Phát âm đúng 5 câu', target: 5, current: 0, reward: 50, isClaimed: false },
        { id: 'gain_xp', title: 'Thu thập 100 XP', target: 100, current: 0, reward: 100, isClaimed: false },
      ],
      
      initQuests: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        if (state.lastQuestDate !== today) {
          return {
            lastQuestDate: today,
            quests: [
              { id: 'add_vocab', title: 'Lưu 3 từ vựng mới', target: 3, current: 0, reward: 30, isClaimed: false },
              { id: 'shadowing', title: 'Phát âm đúng 5 câu', target: 5, current: 0, reward: 50, isClaimed: false },
              { id: 'gain_xp', title: 'Thu thập 100 XP', target: 100, current: 0, reward: 100, isClaimed: false },
            ]
          };
        }
        return state;
      }),

      updateQuest: (id, amount) => set((state) => {
        const newQuests = state.quests.map(q => {
          if (q.id === id && !q.isClaimed) {
            return { ...q, current: Math.min(q.current + amount, q.target) };
          }
          return q;
        });
        return { quests: newQuests };
      }),

      claimQuest: (id) => set((state) => {
         const quest = state.quests.find(q => q.id === id);
         if (quest && quest.current >= quest.target && !quest.isClaimed) {
            let newXp = state.xp + quest.reward;
            let newLevel = state.level;
            let xpRequired = newLevel * 100;
            while (newXp >= xpRequired) {
              newXp -= xpRequired;
              newLevel += 1;
              xpRequired = newLevel * 100;
            }
            
            const newQuests = state.quests.map(q => 
              q.id === id ? { ...q, isClaimed: true } : q
            );
            
            return { quests: newQuests, xp: newXp, level: newLevel };
         }
         return state;
      })
    }),
    {
      name: 'echo-english-vocab',
    }
  )
);
