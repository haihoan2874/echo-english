import React, { useRef } from 'react';
import { Flame, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useHistoryStore } from '../../store/historyStore';
import { useVocabStore } from '../../store/vocabStore';

const StatCards = () => {
  const navigate = useNavigate();
  const { historyList } = useHistoryStore();
  const vocabList = useVocabStore(state => state.vocabList);
  
  const containerRef = useRef();

  useGSAP(() => {
    gsap.from('.stat-card', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.2
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="grid grid-cols-2 gap-4">
      <div className="stat-card bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/10 flex items-center justify-between shadow-sm">
        <div>
          <h3 className="text-slate-300 text-sm font-medium mb-1">Video đang học</h3>
          <p className="text-2xl font-black">{historyList.length}</p>
        </div>
        <div className="p-3 bg-orange-500/20 rounded-2xl text-orange-400">
          <Flame size={20} />
        </div>
      </div>
      
      <div 
        onClick={() => navigate('/vocab')}
        className="stat-card bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/10 cursor-pointer hover:bg-white/15 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between shadow-sm"
      >
        <div>
          <h3 className="text-slate-300 text-sm font-medium mb-1">Từ vựng</h3>
          <p className="text-2xl font-black">{vocabList.length}</p>
        </div>
        <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
          <BookOpen size={20} />
        </div>
      </div>
    </div>
  );
};

export default StatCards;
