import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export const usePlaylistStore = create(
  persist(
    (set, get) => ({
      playlists: [],

      // Create a new empty playlist
      createPlaylist: (name) => {
        const newPlaylist = {
          id: uuidv4(),
          name,
          videos: [], // { videoId, title, thumbnail }
          createdAt: new Date().getTime(),
        };
        set((state) => ({
          playlists: [newPlaylist, ...state.playlists],
        }));
        return newPlaylist.id;
      },

      // Delete a playlist
      deletePlaylist: (id) => {
        set((state) => ({
          playlists: state.playlists.filter(p => p.id !== id),
        }));
      },

      // Add video to playlist
      addVideoToPlaylist: (playlistId, videoData) => {
        set((state) => {
          const updatedPlaylists = state.playlists.map(p => {
            if (p.id === playlistId) {
              // Check if video already exists in this playlist
              if (!p.videos.some(v => v.videoId === videoData.videoId)) {
                return { ...p, videos: [videoData, ...p.videos] };
              }
            }
            return p;
          });
          return { playlists: updatedPlaylists };
        });
      },

      // Remove video from playlist
      removeVideoFromPlaylist: (playlistId, videoId) => {
        set((state) => {
          const updatedPlaylists = state.playlists.map(p => {
            if (p.id === playlistId) {
              return { ...p, videos: p.videos.filter(v => v.videoId !== videoId) };
            }
            return p;
          });
          return { playlists: updatedPlaylists };
        });
      },
    }),
    {
      name: 'echo-playlists',
    }
  )
);
