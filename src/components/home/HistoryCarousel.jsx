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
        x: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.4
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
      <div className="flex flex-col gap-3 min-w-[200px]">
        <p className="text-[14px] font-bold text-slate-900 text-center leading-snug">
          Xóa video này khỏi lịch sử?
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
              removeVideo(video.videoId);
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
    });
  };

  if (historyList.length === 0) return null;

  return (
    <div ref={carouselRef}>
      <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2 px-1 tracking-tight">
        <Clock size={20} className="text-orange-500" strokeWidth={2.5} />
        Đang học dở
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-6 pt-1 px-1 -mx-1 snap-x hide-scrollbar">
        {historyList.map(video => (
          <div key={video.videoId} className="history-card snap-start shrink-0 w-[260px] relative group">
            <Link to={`/lesson/${video.videoId}`} className="block bg-white rounded-[1.25rem] shadow-sm overflow-hidden border border-slate-200 hover:border-slate-300 transition-all active:scale-[0.98]">
              <div className="relative aspect-video bg-slate-100 overflow-hidden border-b border-slate-100">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center transition-colors group-hover:bg-black/20">
                  <PlayCircle className="text-white w-12 h-12 opacity-90 drop-shadow-md group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                </div>
                
                {/* Progress Bar overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                  <div className="h-full bg-slate-900" style={{ width: `${Math.min((video.progressTime / 600) * 100, 100)}%` }}></div>
                </div>
                
                <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-lg">
                  {formatTime(video.progressTime)}
                </div>
              </div>
              <div className="p-3.5 bg-white relative z-10">
                <h3 className="font-bold text-slate-900 text-[14px] line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{video.title}</h3>
              </div>
            </Link>
            <button 
              onClick={(e) => handleRemove(e, video)}
              className="absolute -top-2 -right-2 bg-white text-slate-300 p-2 rounded-full shadow-md border border-slate-200 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all z-20"
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
