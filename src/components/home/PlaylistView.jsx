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
        y: 15,
        opacity: 0,
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
      <div className="flex flex-col gap-3 min-w-[200px]">
        <p className="text-[14px] font-bold text-slate-900 text-center line-clamp-2 leading-snug">
          Xóa thư mục "{playlist.name}"?
        </p>
        <div className="flex gap-2 justify-center mt-1">
          <button 
            className="px-4 py-2 text-[13px] font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors flex-1"
            onClick={() => toast.dismiss(t.id)}
          >
            Hủy
          </button>
          <button 
            className="px-4 py-2 text-[13px] font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors shadow-md shadow-red-500/20 flex-1 active:scale-95"
            onClick={() => {
              deletePlaylist(playlist.id);
              toast.dismiss(t.id);
              toast.success('Đã xóa', { style: { minWidth: '150px' } });
            }}
          >
            Xóa
          </button>
        </div>
      </div>
    ), { 
      duration: 5000,
      // Removed the ugly dark style so it inherits the beautiful global premium-toast
    });
  };

  const handleRemoveVideo = (e, playlistId, videoId) => {
    e.preventDefault();
    e.stopPropagation();
    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[200px]">
        <p className="text-[14px] font-bold text-slate-900 text-center leading-snug">
          Xóa video khỏi danh sách?
        </p>
        <div className="flex gap-2 justify-center mt-1">
          <button 
            className="px-4 py-2 text-[13px] font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors flex-1"
            onClick={() => toast.dismiss(t.id)}
          >
            Hủy
          </button>
          <button 
            className="px-4 py-2 text-[13px] font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors shadow-md shadow-red-500/20 flex-1 active:scale-95"
            onClick={() => {
              removeVideoFromPlaylist(playlistId, videoId);
              toast.dismiss(t.id);
              toast.success('Đã xóa', { style: { minWidth: '150px' } });
            }}
          >
            Xóa
          </button>
        </div>
      </div>
    ), { 
      duration: 5000,
      // Removed the ugly dark style
    });
  };

  return (
    <div ref={listRef}>
      <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2 px-1 tracking-tight">
        <Folder size={20} className="text-slate-900" />
        Danh sách phát
      </h2>
      
      {playlists.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-sm">
          <Folder size={40} className="mx-auto text-slate-300 mb-4" strokeWidth={1.5} />
          <p className="text-slate-900 font-bold mb-1">Chưa có danh sách nào</p>
          <p className="text-sm text-slate-500 font-medium">Dán link YouTube ở trên để bắt đầu tạo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {playlists.map(playlist => {
            const isExpanded = expandedPlaylists[playlist.id];
            return (
              <div key={playlist.id} className="playlist-card bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                {/* Playlist Header (Accordion Toggle) */}
                <div 
                  onClick={() => togglePlaylist(playlist.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center shrink-0">
                      <Folder size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-[16px]">{playlist.name}</h3>
                      <p className="text-[13px] text-slate-500 font-medium mt-0.5">{playlist.videos.length} video</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => handleDeletePlaylist(e, playlist)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="text-slate-400 transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <ChevronDown size={18} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>

                {/* Playlist Videos */}
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="bg-[#F8F9FA] p-3 border-t border-slate-100 flex flex-col gap-2">
                    {playlist.videos.length === 0 ? (
                      <p className="text-[13px] text-slate-400 italic font-medium text-center py-4">Danh sách trống</p>
                    ) : (
                      playlist.videos.map(video => (
                        <Link 
                          key={video.videoId}
                          to={`/lesson/${video.videoId}`}
                          className="flex bg-white rounded-xl p-2 pr-3 gap-3 shadow-sm border border-slate-200 hover:border-slate-300 transition-all active:scale-[0.98] items-center relative group"
                        >
                          <div className="relative w-28 aspect-video bg-slate-200 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                              <Play className="text-white w-6 h-6 fill-white/80 group-hover:fill-white group-hover:scale-110 transition-all" />
                            </div>
                          </div>
                          <div className="flex-1 pr-8">
                            <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{video.title}</h4>
                          </div>
                          <button 
                            onClick={(e) => handleRemoveVideo(e, playlist.id, video.videoId)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 p-1.5 rounded-lg z-20 transition-all border border-slate-200"
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
