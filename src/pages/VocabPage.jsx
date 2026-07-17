import React, { useState, useEffect, useRef } from 'react';
import { useVocabStore } from '../store/vocabStore';
import { Trash2, Volume2, RotateCcw, Check, X, BookOpen, Brain, Download, FolderPlus, ArrowRight, Play, AlertCircle, Loader2, Trophy, Flame, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { PRESET_PACKS } from '../data/vocabData';

const speak = (text) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en'));
  if (enVoice) utterance.voice = enVoice;

  utterance.lang = 'en-US';
  utterance.rate = useVocabStore.getState().settings.voiceSpeed || 0.85;
  window.speechSynthesis.speak(utterance);
};

// ────────────────────────────────────────────────────────────
// Mini Games
// ────────────────────────────────────────────────────────────

const QuizGame = ({ task, onResult }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (option) => {
    if (selected) return;
    setSelected(option);
    
    // Play sound of selected word
    speak(option);

    const isCorrect = option.toLowerCase() === task.vocab.word.toLowerCase();
    setTimeout(() => {
      onResult(isCorrect);
    }, 1200);
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center">
      <div className="bg-white w-full p-8 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-blue-500"></div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Chọn từ đúng nghĩa</p>
        <h2 className="text-2xl font-extrabold text-slate-900 text-center">{task.vocab.definition}</h2>
      </div>

      <div className="w-full space-y-3">
        {task.options.map((opt, i) => {
          let btnClass = "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50";
          if (selected === opt) {
            btnClass = opt.toLowerCase() === task.vocab.word.toLowerCase() 
              ? "bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500" 
              : "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500";
          } else if (selected && opt.toLowerCase() === task.vocab.word.toLowerCase()) {
            btnClass = "bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500"; 
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              className={`w-full py-4 px-5 rounded-xl font-semibold text-[17px] text-left flex items-center justify-between transition-all active:scale-[0.98] ${btnClass}`}
            >
              <span>{opt}</span>
              {selected === opt && opt.toLowerCase() === task.vocab.word.toLowerCase() && <Check size={20} className="text-green-600" />}
              {selected === opt && opt.toLowerCase() !== task.vocab.word.toLowerCase() && <X size={20} className="text-red-600" />}
              {selected && selected !== opt && opt.toLowerCase() === task.vocab.word.toLowerCase() && <Check size={20} className="text-green-600" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const SpellingGame = ({ task, onResult }) => {
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    speak(task.vocab.word);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || checked) return;
    
    const correct = input.trim().toLowerCase() === task.vocab.word.toLowerCase();
    setIsCorrect(correct);
    setChecked(true);
    
    if (!correct) {
      speak(task.vocab.word); // replay on wrong
    }

    setTimeout(() => {
      onResult(correct);
    }, 1500);
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center">
      <div className="mb-10 flex flex-col items-center gap-5">
        <button 
          onClick={() => speak(task.vocab.word)}
          className="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Volume2 size={32} />
        </button>
        <p className="text-slate-500 font-medium text-[13px] tracking-wide uppercase">Nghe và viết lại từ</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={checked}
          placeholder="Gõ từ bạn nghe được..."
          className={`w-full bg-white border-2 px-5 py-4 rounded-xl text-xl font-bold text-center outline-none transition-colors ${
            !checked ? 'border-slate-200 focus:border-blue-500 shadow-sm' : 
            isCorrect ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'
          }`}
        />
        
        {checked && !isCorrect && (
          <div className="mt-4 bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
            <p className="text-[13px] text-slate-500 font-medium mb-1">Đáp án đúng:</p>
            <p className="text-lg font-bold tracking-wide text-slate-900">{task.vocab.word}</p>
          </div>
        )}

        {!checked && (
          <button type="submit" className="mt-5 w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition-transform">
            Kiểm tra
          </button>
        )}
      </form>
    </div>
  );
};

const FillBlankGame = ({ task, onResult }) => {
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef(null);

  // Replace the target word (case insensitive) with blanks
  const regex = new RegExp(`\\b${task.vocab.word}\\b`, 'gi');
  const sentenceParts = task.vocab.context.split(regex);
  const showBlank = sentenceParts.length > 1; // Sanity check

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || checked) return;
    
    const correct = input.trim().toLowerCase() === task.vocab.word.toLowerCase();
    setIsCorrect(correct);
    setChecked(true);
    
    if (!correct) {
      speak(task.vocab.word);
    } else {
      speak(task.vocab.context); // speak full sentence on correct
    }

    setTimeout(() => {
      onResult(correct);
    }, 2000);
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center">
      <div className="bg-white w-full p-8 rounded-2xl shadow-sm border border-slate-200 mb-6 min-h-[160px] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500"></div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">Điền từ vào chỗ trống</p>
        
        {showBlank ? (
          <p className="text-[19px] font-medium text-slate-800 leading-relaxed text-center">
            {sentenceParts[0]}
            <span className="inline-block w-20 border-b-2 border-slate-400 mx-2 mb-[-2px]"></span>
            {sentenceParts[1]}
          </p>
        ) : (
           <p className="text-lg font-medium text-slate-800 text-center">{task.vocab.context}</p>
        )}
        
        <p className="text-center text-sm text-slate-500 font-medium mt-5">({task.vocab.definition})</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={checked}
          placeholder="Gõ từ còn thiếu..."
          className={`w-full bg-white border-2 px-5 py-4 rounded-xl text-lg font-bold text-center outline-none transition-colors ${
            !checked ? 'border-slate-200 focus:border-indigo-500 shadow-sm' : 
            isCorrect ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'
          }`}
        />

        {checked && !isCorrect && (
          <div className="mt-4 bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
            <p className="text-[13px] text-slate-500 font-medium mb-1">Đáp án đúng:</p>
            <p className="text-lg font-bold tracking-wide text-slate-900">{task.vocab.word}</p>
          </div>
        )}

        {!checked && (
          <button type="submit" className="mt-5 w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition-transform">
            Kiểm tra
          </button>
        )}
      </form>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// Practice Mode (Duolingo style)
// ────────────────────────────────────────────────────────────
const PracticeMode = ({ vocabList, onExit }) => {
  const addXP = useVocabStore(state => state.addXP);
  const reviewVocab = useVocabStore(state => state.reviewVocab);
  const [queue, setQueue] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [done, setDone] = useState(false);

  // Initialize Tasks
  useEffect(() => {
    // Generate tasks for each word
    let tasks = [];
    
    // Helper to get 3 fake options
    const getFakeOptions = (correctWord) => {
      const others = vocabList.filter(v => v.word.toLowerCase() !== correctWord.toLowerCase()).map(v => v.word);
      // fallback if not enough words
      while (others.length < 3) {
         others.push(['Apple', 'Cat', 'Run', 'Beautiful', 'Quickly'][Math.floor(Math.random()*5)]);
      }
      // shuffle others and take 3
      const fakes = others.sort(() => 0.5 - Math.random()).slice(0, 3);
      const finalOptions = [correctWord, ...fakes].sort(() => 0.5 - Math.random());
      return finalOptions;
    };

    vocabList.forEach((v) => {
      // Pick a random game type for this word
      const availableTypes = ['quiz', 'spelling'];
      if (v.context && v.context.trim().length > 5) {
        availableTypes.push('fill');
      }
      const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      
      tasks.push({
        id: Math.random().toString(),
        type,
        vocab: v,
        options: type === 'quiz' ? getFakeOptions(v.word) : []
      });
    });

    setQueue(tasks.sort(() => 0.5 - Math.random()));
  }, [vocabList]);

  const total = queue.length;
  const progress = total === 0 ? 0 : Math.round((currentIdx / total) * 100);

  const handleResult = (correct) => {
    const currentVocabId = queue[currentIdx].vocab.id;
    reviewVocab(currentVocabId, correct);

    if (correct) {
      setKnownCount(p => p + 1);
      addXP(10); // Reward 10 XP for correct answer
    } else {
      // Re-queue the task to end
      setQueue(q => {
        const newQ = [...q];
        newQ.push({...newQ[currentIdx], id: Math.random().toString()}); // clone with new ID
        return newQ;
      });
    }

    if (currentIdx + 1 >= queue.length && correct) {
      setDone(true);
    } else {
      setCurrentIdx(i => i + 1);
    }
  };

  if (queue.length === 0) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center bg-slate-50 min-h-[calc(100dvh-64px)] pb-24">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Bài học hoàn tất!</h2>
        <p className="text-slate-500 mb-6">Tuyệt vời, bạn đã vượt qua <span className="font-bold text-green-600">{knownCount}</span> thử thách.</p>
        
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6 w-full max-w-xs mb-8 shadow-sm">
           <div className="flex justify-between items-center mb-1">
             <span className="text-slate-500 font-bold text-sm">Kinh nghiệm nhận được</span>
             <span className="text-xl font-black text-orange-500">+{knownCount * 10} XP</span>
           </div>
        </div>

        <button
          onClick={onExit}
          className="bg-slate-900 text-white font-bold py-4 px-10 rounded-2xl hover:bg-black transition-colors shadow-lg active:scale-95 w-full max-w-xs"
        >
          Tiếp tục
        </button>
      </div>
    );
  }

  const currentTask = queue[currentIdx];

  return (
    <div className="flex flex-col h-full bg-slate-50 pb-24 min-h-[calc(100dvh-64px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4 shrink-0">
        <button onClick={onExit} className="text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm">
          ← Thoát
        </button>
        <div className="text-center flex-1 mx-4">
          <div className="h-2.5 bg-slate-200 w-full rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="text-slate-400 font-bold text-sm w-10 text-right">
          {knownCount}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center pt-8 px-4">
        {currentTask.type === 'quiz' && <QuizGame key={currentTask.id} task={currentTask} onResult={handleResult} />}
        {currentTask.type === 'spelling' && <SpellingGame key={currentTask.id} task={currentTask} onResult={handleResult} />}
        {currentTask.type === 'fill' && <FillBlankGame key={currentTask.id} task={currentTask} onResult={handleResult} />}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// VocabPage: main
// ────────────────────────────────────────────────────────────
const VocabPage = () => {
  const { vocabList, addVocab, removeVocab, xp, level, streak } = useVocabStore();
  const [mode, setMode] = useState('list'); // 'list' | 'practice' | 'library'

  const handleImportPack = (pack) => {
    let addedCount = 0;
    pack.words.forEach(w => {
      if (!vocabList.some(existing => existing.word.toLowerCase() === w.word.toLowerCase())) {
        addVocab(w.word, w.definition, w.context);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      toast.success(`Đã thêm ${addedCount} từ vựng mới!`);
    } else {
      toast('Các từ này đã có trong Sổ tay của bạn.', { style: { minWidth: '200px' } });
    }
    setMode('list');
  };

  const now = new Date();
  const dueVocabs = vocabList.filter(v => !v.nextReviewDate || new Date(v.nextReviewDate) <= now);

  if (mode === 'practice') {
    if (vocabList.length === 0) {
      setMode('list');
      return null;
    }
    if (dueVocabs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center bg-slate-50 min-h-[calc(100dvh-64px)] pb-24">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Tuyệt vời!</h2>
          <p className="text-slate-500 mb-6 font-medium">Bạn đã hoàn thành tất cả bài ôn tập hôm nay.<br/>Hãy quay lại vào ngày mai nhé.</p>
          <button
            onClick={() => setMode('list')}
            className="bg-slate-900 text-white font-bold py-4 px-10 rounded-2xl hover:bg-black transition-colors shadow-lg active:scale-95 w-full max-w-xs"
          >
            Quay lại Sổ tay
          </button>
        </div>
      );
    }
    return (
      <PracticeMode
        vocabList={dueVocabs}
        onExit={() => setMode('list')}
      />
    );
  }

  if (mode === 'library') {
    return (
      <div className="pb-24 min-h-[calc(100dvh-64px)] bg-[#F8F9FA]">
        <div className="bg-white border-b border-slate-200/60 px-5 pt-10 pb-5 shadow-sm sticky top-0 z-20 flex items-center justify-between">
          <button onClick={() => setMode('list')} className="text-slate-400 hover:text-slate-900 font-bold text-sm tracking-wide uppercase transition-colors">← Quay lại</button>
          <h1 className="font-black text-xl text-slate-900 tracking-tight">Thư viện.</h1>
          <div className="w-16"></div>
        </div>
        <div className="p-5 max-w-md mx-auto w-full space-y-4">
          {PRESET_PACKS.map((pack, index) => {
            const savedCount = pack.words.filter(w => vocabList.some(v => v.word.toLowerCase() === w.word.toLowerCase())).length;
            const total = pack.words.length;
            const progressPercent = total > 0 ? Math.round((savedCount / total) * 100) : 0;
            const isCompleted = savedCount === total;

            // Level requirements
            let requiredLevel = 1;
            if (index === 1) requiredLevel = 3;
            if (index === 2) requiredLevel = 6;
            if (index === 3) requiredLevel = 10;
            const isLocked = level < requiredLevel;

            // Extract emoji from title to use as icon
            const emojiMatch = pack.title.match(/^[\p{Emoji}\u200d]+/u);
            const emoji = emojiMatch ? emojiMatch[0] : '📚';
            const cleanTitle = pack.title.replace(/^[\p{Emoji}\u200d]+\s*/u, '');

            return (
              <div key={pack.id} className={`bg-white p-5 rounded-3xl shadow-sm border ${isLocked ? 'border-slate-100 opacity-70 grayscale-[0.5]' : 'border-slate-200'} flex flex-col gap-4 relative overflow-hidden group`}>
                <div className="flex gap-4 relative z-10">
                  <div className="w-14 h-14 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl border border-slate-100 shadow-sm">
                    {isLocked ? '🔒' : emoji}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg font-black text-slate-900 mb-1 leading-tight tracking-tight">{cleanTitle}</h3>
                    <p className="text-slate-500 text-[13px] font-medium leading-relaxed">{pack.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <button 
                    onClick={() => {
                      if (isLocked) {
                        toast.error(`Cần đạt Cấp ${requiredLevel} để mở khóa!`, { icon: '🔒' });
                        return;
                      }
                      handleImportPack(pack);
                    }}
                    disabled={isCompleted && !isLocked}
                    className={`flex-1 h-11 relative rounded-xl overflow-hidden flex items-center justify-center group/btn transition-colors ${
                      isLocked 
                        ? 'bg-slate-100 text-slate-500 border border-slate-200 font-bold text-[13px] cursor-pointer' 
                        : 'bg-slate-50 border border-slate-200 cursor-pointer disabled:cursor-default disabled:bg-slate-50 disabled:border-slate-100'
                    }`}
                  >
                    {!isLocked && (
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-slate-200 transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    )}
                    <span className="relative z-10 text-[13px] font-bold text-slate-700">
                      {isLocked ? `Yêu cầu Cấp ${requiredLevel}` : isCompleted ? 'Đã tải xong' : `${savedCount} / ${total}`}
                    </span>
                    {!isCompleted && !isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white font-bold opacity-0 group-hover/btn:opacity-100 transition-opacity z-20 text-[13px]">
                        Tải về ngay
                      </div>
                    )}
                  </button>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                    isCompleted && !isLocked ? 'border-slate-900 bg-slate-900 text-white' 
                    : isLocked ? 'border-slate-200 bg-slate-100 text-slate-300' 
                    : 'border-slate-200 bg-slate-50 text-slate-300'
                  }`}>
                    <Trophy size={18} className={isCompleted && !isLocked ? "fill-white" : "fill-transparent"} strokeWidth={isCompleted && !isLocked ? 2 : 2.5} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 min-h-[calc(100dvh-64px)] bg-[#F8F9FA]">
      {/* Minimal Header */}
      <div className="bg-white border-b border-slate-200/60 px-5 pt-8 pb-5 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between max-w-md mx-auto w-full">
          <div>
            <h1 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Đã lưu {vocabList.length} từ</h1>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Từ vựng.</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('library')}
              className="w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <FolderPlus size={20} />
            </button>
            {vocabList.length > 0 && (
              <button
                onClick={() => setMode('practice')}
                className="w-11 h-11 flex items-center justify-center bg-slate-900 text-white rounded-xl shadow-md shadow-slate-900/10 hover:bg-slate-800 transition-colors relative"
              >
                <Brain size={20} />
                {dueVocabs.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {dueVocabs.length > 99 ? '99+' : dueVocabs.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 max-w-md mx-auto w-full">
        {vocabList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm mt-4">
            <BookOpen size={40} className="mx-auto text-slate-300 mb-4" strokeWidth={1.5} />
            <p className="text-slate-900 font-bold mb-1">Chưa có từ vựng</p>
            <p className="text-sm text-slate-500 font-medium mb-6 px-4">Hãy tải bộ từ vựng mẫu để bắt đầu học ngay nhé.</p>
            <button 
              onClick={() => setMode('library')}
              className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors text-sm"
            >
              Vào Thư viện
            </button>
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {vocabList.map((vocab, idx) => (
              <div key={`${vocab.id}-${idx}`} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 group relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-100 group-hover:bg-slate-900 transition-colors"></div>
                
                <div className="flex justify-between items-start mb-2 pl-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-black text-slate-900 capitalize tracking-tight">{vocab.word}</h3>
                    {vocab.box > 0 ? (
                      <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md">Lv.{vocab.box}</span>
                    ) : (
                      <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md">Cần ôn</span>
                    )}
                    <button
                      onClick={() => speak(vocab.word)}
                      className="text-slate-400 p-1.5 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
                    >
                      <Volume2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      removeVocab(vocab.id);
                      toast.success(`Đã xóa "${vocab.word}"`, { id: 'delete-vocab' });
                    }}
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors p-1.5 rounded-lg -mt-1 -mr-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="pl-3">
                  <p className="text-[14px] text-slate-700 font-bold mb-3">{vocab.definition}</p>

                  {vocab.context && (
                    <div className="bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100 flex items-start">
                      <p className="text-[13px] text-slate-500 font-medium italic leading-relaxed">"{vocab.context}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabPage;
