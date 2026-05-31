import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock, PlayCircle, Trash2 } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import { useHistoryStore } from '../../store/historyStore';

const HistoryCarousel = () => {
  const { historyList, removeVideo } = useHistoryStore();
  const carouselRef = useRef();

  useGSAP(() => {
    if (historyList.length > 0) {
      gsap.from('.history-card', {
        x: 50,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.7
      });
    }
  }, [historyList.length]);

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRemove = (e, video) => {
    e.preventDefault();
    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[180px]">
        <p className="text-sm font-semibold text-white text-center">Xóa video này khỏi lịch sử?</p>
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
              removeVideo(video.videoId);
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
      style: {
        background: '#1e293b', // slate-800
        border: '1px solid #334155', // slate-700
        padding: '16px',
        borderRadius: '16px'
      }
    });
  };

  if (historyList.length === 0) return null;

  return (
    <div ref={carouselRef}>
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 px-1">
        <Clock size={22} className="text-orange-500" />
        Đang học dở
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-1 -mx-1 snap-x hide-scrollbar">
        {historyList.map(video => (
          <div key={video.videoId} className="history-card snap-start shrink-0 w-64 relative group">
            <Link to={`/lesson/${video.videoId}`} className="block bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 hover:shadow-lg transition-all active:scale-[0.98] hover:-translate-y-1">
              <div className="relative aspect-video bg-slate-200 overflow-hidden">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/20">
                  <PlayCircle className="text-white w-12 h-12 opacity-90 drop-shadow-lg group-hover:scale-110 transition-transform" />
                </div>
                
                {/* Progress Bar overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/30">
                  <div className="h-full bg-primary" style={{ width: `${Math.min((video.progressTime / 600) * 100, 100)}%` }}></div>
                </div>
                
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  {formatTime(video.progressTime)}
                </div>
              </div>
              <div className="p-3 bg-white relative z-10">
                <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">{video.title}</h3>
              </div>
            </Link>
            <button 
              onClick={(e) => handleRemove(e, video)}
              className="absolute -top-2 -right-2 bg-white text-red-400 p-2 rounded-full shadow-lg border border-slate-100 hover:text-red-600 hover:bg-red-50 transition-colors z-20"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default HistoryCarousel;
