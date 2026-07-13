import React, { useMemo } from 'react';
import { useVocabStore } from '../../store/vocabStore';

const HeatmapGraph = () => {
  const studyLogs = useVocabStore(state => state.studyLogs) || {};

  // Generate the last 12 weeks of dates
  const grid = useMemo(() => {
    const WEEKS = 15; // 15 weeks
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from Sunday of the week 15 weeks ago
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (today.getDay()) - (WEEKS * 7) + 7);

    for (let i = 0; i < WEEKS * 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        xp: studyLogs[dateStr] || 0,
        isFuture: d > today
      });
    }

    // Split into weeks (columns)
    const weeksArray = [];
    for (let i = 0; i < days.length; i += 7) {
      weeksArray.push(days.slice(i, i + 7));
    }
    return weeksArray;
  }, [studyLogs]);

  // Color logic
  const getColor = (xp) => {
    if (xp === 0) return 'bg-slate-100';
    if (xp < 50) return 'bg-indigo-200';
    if (xp < 100) return 'bg-indigo-400';
    if (xp < 200) return 'bg-indigo-500';
    return 'bg-indigo-600'; // Super active
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-8">
      <h3 className="text-[14px] font-bold text-slate-900 mb-4 tracking-tight">Hoạt động (15 tuần)</h3>
      
      <div className="overflow-x-auto pb-2 scrollbar-hide">
        <div className="inline-flex gap-1.5 min-w-max">
          {grid.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day, dIdx) => (
                <div 
                  key={day.date} 
                  title={`${day.date}: ${day.xp} XP`}
                  className={`w-[13px] h-[13px] rounded-[3px] transition-colors ${
                    day.isFuture ? 'bg-transparent' : getColor(day.xp)
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] font-bold text-slate-400">
        <span>Ít</span>
        <div className="w-2.5 h-2.5 rounded-sm bg-slate-100"></div>
        <div className="w-2.5 h-2.5 rounded-sm bg-indigo-200"></div>
        <div className="w-2.5 h-2.5 rounded-sm bg-indigo-400"></div>
        <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></div>
        <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600"></div>
        <span>Nhiều</span>
      </div>
    </div>
  );
};

export default HeatmapGraph;
