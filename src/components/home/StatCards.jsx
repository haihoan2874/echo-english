import React, { useRef } from 'react';
import { Flame, BookOpen, Trophy, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import { useHistoryStore } from '../../store/historyStore';
import { useVocabStore } from '../../store/vocabStore';

const StatCards = () => {
  const navigate = useNavigate();
  const { historyList } = useHistoryStore();
  const { vocabList, xp, level, streak, quests, initQuests, claimQuest } = useVocabStore();
  
  const containerRef = useRef();

  React.useEffect(() => {
    initQuests();
  }, [initQuests]);

  useGSAP(() => {
    gsap.from('.stat-card', {
      y: 15,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.1
    });
  }, { scope: containerRef });

  const handleClaim = (quest) => {
    // Save level before claiming to check if leveled up
    const levelBefore = level;
    
    claimQuest(quest.id);
    
    toast.success(
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-slate-900">Hoàn thành nhiệm vụ!</span>
        <span className="text-[13px] text-slate-500 font-medium">Bạn nhận được <span className="font-black text-blue-600">+{quest.reward} XP</span></span>
      </div>,
      {
        icon: '🎉',
        style: { padding: '14px 16px', minWidth: '250px' }
      }
    );

    // Check if leveled up
    setTimeout(() => {
      const levelAfter = useVocabStore.getState().level;
      if (levelAfter > levelBefore) {
        toast.success(
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-slate-900">Thăng cấp!</span>
            <span className="text-[13px] text-slate-500 font-medium">Bạn đã đạt <span className="font-black text-orange-500">Cấp {levelAfter}</span></span>
          </div>,
          {
            icon: '🔥',
            duration: 5000,
            style: { padding: '14px 16px', minWidth: '250px', border: '1px solid rgba(249, 115, 22, 0.3)' }
          }
        );
      }
    }, 500); // slight delay so the xp toast appears first
  };

  const xpRequired = level * 100;
  const progressPercent = Math.min(100, Math.round((xp / xpRequired) * 100));

  const getRank = (lvl) => {
    if (lvl < 3) return { name: 'Tân Binh', icon: '🌱' };
    if (lvl < 6) return { name: 'Chiến Binh', icon: '⚔️' };
    if (lvl < 10) return { name: 'Cao Thủ', icon: '👑' };
    return { name: 'Huyền Thoại', icon: '🚀' };
  };
  const rank = getRank(level);

  return (
    <div ref={containerRef} className="flex flex-col gap-3">
      {/* Level & XP Card */}
      <div className="stat-card bg-white rounded-[1.25rem] p-5 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute -top-4 -right-4 p-4 opacity-[0.03]">
           <Trophy size={120} />
        </div>
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-md text-2xl">
              {rank.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Cấp {level} • {rank.name}</p>
              <h3 className="text-[19px] font-black text-slate-900 tracking-tight leading-none">Danh hiệu</h3>
            </div>
          </div>
          <div className="text-right">
             <div className="flex items-center justify-end gap-1.5 text-orange-500 font-black tracking-tight">
               <Flame size={20} className="fill-orange-500" strokeWidth={2.5} />
               <span className="text-[22px] leading-none">{streak}</span>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Ngày học</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative z-10">
          <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
            <span className="text-blue-500">{xp} XP</span>
            <span>{xpRequired} XP</span>
          </div>
          <div className="h-2.5 bg-slate-100 w-full rounded-full overflow-hidden border border-slate-200/50">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Video Card */}
        <div className="stat-card bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between h-[104px]">
          <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Video đã học</h3>
          <div className="flex items-end justify-between">
            <p className="text-[28px] font-black text-slate-900 leading-none tracking-tight">{historyList.length}</p>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
              <BookOpen size={14} strokeWidth={2.5} />
            </div>
          </div>
        </div>
        
        {/* Vocab Card */}
        <div 
          onClick={() => navigate('/vocab')}
          className="stat-card bg-slate-900 rounded-2xl p-4 cursor-pointer hover:bg-slate-800 transition-all active:scale-[0.98] flex flex-col justify-between shadow-md shadow-slate-900/20 h-[104px]"
        >
          <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Từ vựng</h3>
          <div className="flex items-end justify-between">
             <p className="text-[28px] font-black text-white leading-none tracking-tight">{vocabList.length}</p>
             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
               <Zap size={14} className="fill-white" />
             </div>
          </div>
        </div>
      </div>

      {/* Daily Quests Section */}
      <div className="stat-card bg-white rounded-[1.25rem] p-5 border border-slate-200 shadow-sm mt-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 font-black text-[15px]">Nhiệm vụ hôm nay</h3>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase tracking-wider">Mới</span>
        </div>
        
        <div className="space-y-3">
          {quests.map(quest => (
            <div key={quest.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex-1 mr-3">
                <p className={`text-[13px] font-bold mb-1 ${quest.isClaimed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                  {quest.title}
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${quest.isClaimed ? 'bg-slate-400' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                    {quest.current}/{quest.target}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => handleClaim(quest)}
                disabled={quest.isClaimed || quest.current < quest.target}
                className={`shrink-0 w-16 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all ${
                  quest.isClaimed 
                    ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                    : quest.current >= quest.target
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 active:scale-95 animate-pulse'
                      : 'bg-white text-blue-600 border border-blue-100'
                }`}
              >
                {quest.isClaimed ? 'Đã nhận' : `+${quest.reward} XP`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatCards;
