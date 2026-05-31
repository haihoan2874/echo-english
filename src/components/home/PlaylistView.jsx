import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Folder, Trash2, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import { usePlaylistStore } from '../../store/playlistStore';

const PlaylistView = () => {
  const { playlists, deletePlaylist, removeVideoFromPlaylist } = usePlaylistStore();
  const [expandedPlaylists, setExpandedPlaylists] = useState({});
  const listRef = useRef();

  useGSAP(() => {
    if (playlists.length > 0) {
      gsap.from(listRef.current.querySelectorAll('.playlist-card'), {
        y: 24,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'transform'
      });
    }
  }, { scope: listRef, dependencies: [playlists.length] });

  const togglePlaylist = (id) => {
    setExpandedPlaylists(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeletePlaylist = (e, playlist) => {
    e.stopPropagation();
    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[180px]">
        <p className="text-sm font-semibold text-white text-center line-clamp-2">Xóa thư mục "{playlist.name}"?</p>
        <div className="flex gap-2 justify-center">
          <button 
            className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-slate-700 rounded-full hover:bg-slate-600 hover:text-white transition-colors flex-1"
            onClick={() => toast.dismiss(t.id)}
          >
            Hủy
          </button>
          <button 
            className="px-4 py-1.5 text-xs font-bold text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 flex-1"
            onClick={() => {
              deletePlaylist(playlist.id);
              toast.dismiss(t.id);
              toast.success('Đã xóa!', { icon: '🗑️' });
            }}
          >
            Xóa
          </button>
        </div>
      </div>
    ), { 
      duration: 5000,
      style: { background: '#1e293b', border: '1px solid #334155', padding: '16px', borderRadius: '16px' }
    });
  };

  const handleRemoveVideo = (e, playlistId, videoId) => {
    e.preventDefault();
    e.stopPropagation();
    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[180px]">
        <p className="text-sm font-semibold text-white text-center">Xóa video khỏi danh sách?</p>
        <div className="flex gap-2 justify-center">
          <button 
            className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-slate-700 rounded-full hover:bg-slate-600 hover:text-white transition-colors flex-1"
            onClick={() => toast.dismiss(t.id)}
          >
            Hủy
          </button>
          <button 
            className="px-4 py-1.5 text-xs font-bold text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 flex-1"
            onClick={() => {
              removeVideoFromPlaylist(playlistId, videoId);
              toast.dismiss(t.id);
              toast.success('Đã xóa!', { icon: '🗑️' });
            }}
          >
            Xóa
          </button>
        </div>
      </div>
    ), { 
      duration: 5000,
      style: { background: '#1e293b', border: '1px solid #334155', padding: '16px', borderRadius: '16px' }
    });
  };

  return (
    <div ref={listRef}>
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 px-1">
        <Folder size={22} className="text-primary" />
        Danh sách phát của tôi
      </h2>
      
      {playlists.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center shadow-sm">
          <Folder size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Bạn chưa tạo danh sách nào.</p>
          <p className="text-sm text-slate-400 mt-1">Dán link YouTube ở trên để bắt đầu tạo nhé.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {playlists.map(playlist => {
            const isExpanded = expandedPlaylists[playlist.id];
            return (
              <div key={playlist.id} className="playlist-card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300">
                {/* Playlist Header (Accordion Toggle) */}
                <div 
                  onClick={() => togglePlaylist(playlist.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                      <Folder size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{playlist.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{playlist.videos.length} video</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => handleDeletePlaylist(e, playlist)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="text-slate-400 transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                {/* Playlist Videos */}
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col gap-3">
                    {playlist.videos.length === 0 ? (
                      <p className="text-sm text-slate-400 italic text-center py-2">Danh sách trống</p>
                    ) : (
                      playlist.videos.map(video => (
                        <Link 
                          key={video.videoId}
                          to={`/lesson/${video.videoId}`}
                          className="flex bg-white rounded-xl p-2 pr-3 gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-[0.98] items-center relative group"
                        >
                          <div className="relative w-28 aspect-video bg-slate-200 rounded-lg overflow-hidden shrink-0">
                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                              <Play className="text-white w-6 h-6 fill-white/20 group-hover:fill-white/80 transition-all" />
                            </div>
                          </div>
                          <div className="flex-1 pr-6">
                            <h4 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">{video.title}</h4>
                          </div>
                          <button 
                            onClick={(e) => handleRemoveVideo(e, playlist.id, video.videoId)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 bg-white p-1.5 rounded-full z-20 transition-all shadow-sm border border-slate-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlaylistView;
