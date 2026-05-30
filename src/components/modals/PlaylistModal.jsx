import React, { useState } from 'react';
import { X, Folder } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePlaylistStore } from '../../store/playlistStore';

const PlaylistModal = ({ isOpen, onClose, videoData }) => {
  const { playlists, createPlaylist, addVideoToPlaylist } = usePlaylistStore();
  const [newPlaylistName, setNewPlaylistName] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!newPlaylistName.trim()) return;
    const newId = createPlaylist(newPlaylistName);
    addVideoToPlaylist(newId, videoData);
    setNewPlaylistName('');
    onClose();
    toast.success('Đã tạo và lưu thành công!');
  };

  const handleAddToExisting = (playlistId) => {
    addVideoToPlaylist(playlistId, videoData);
    onClose();
    toast.success('Đã lưu vào danh sách!');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-full transition-colors">
          <X size={20} />
        </button>
        
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Folder size={24} className="text-primary" />
          Lưu Video
        </h3>
        
        {/* Video Preview */}
        {videoData && (
          <div className="flex gap-3 items-center mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <img src={videoData.thumbnail} className="w-16 h-10 object-cover rounded-md" alt="Thumb" />
            <p className="text-sm font-semibold text-slate-700 line-clamp-2">{videoData.title}</p>
          </div>
        )}

        <div className="mb-6">
          <p className="text-sm font-medium text-slate-500 mb-2">Thêm vào Playlist hiện có:</p>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {playlists.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Chưa có danh sách nào.</p>
            ) : (
              playlists.map(p => (
                <button 
                  key={p.id}
                  onClick={() => handleAddToExisting(p.id)}
                  className="w-full text-left bg-slate-50 hover:bg-slate-100 p-3 rounded-xl text-slate-700 font-medium transition-colors border border-slate-200 group"
                >
                  <span className="group-hover:text-primary transition-colors">{p.name}</span>
                  <span className="text-xs text-slate-400 ml-1">({p.videos.length})</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500 mb-2">Hoặc tạo Playlist mới:</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Tên danh sách..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
            />
            <button 
              onClick={handleCreate}
              disabled={!newPlaylistName.trim()}
              className="bg-primary text-white p-2 px-4 rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:hover:bg-primary"
            >
              Tạo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;
