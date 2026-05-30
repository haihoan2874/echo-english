import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useHistoryStore = create(
  persist(
    (set, get) => ({
      historyList: [],
      addOrUpdateVideo: (videoId, title, thumbnail, progressTime = 0) => 
        set((state) => {
          const existingIndex = state.historyList.findIndex(v => v.videoId === videoId);
          let newList = [...state.historyList];
          
          if (existingIndex >= 0) {
            newList[existingIndex] = {
              ...newList[existingIndex],
              progressTime: Math.max(newList[existingIndex].progressTime, progressTime),
              lastWatched: new Date().toISOString()
            };
          } else {
            newList.unshift({
              videoId,
              title: title || `Video ${videoId}`,
              thumbnail: thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              progressTime,
              lastWatched: new Date().toISOString()
            });
          }
          
          return { historyList: newList };
        }),
      removeVideo: (videoId) => 
        set((state) => ({
          historyList: state.historyList.filter(v => v.videoId !== videoId)
        })),
      getProgress: (videoId) => {
        const video = get().historyList.find(v => v.videoId === videoId);
        return video ? video.progressTime : 0;
      }
    }),
    {
      name: 'echo-english-history',
    }
  )
);
