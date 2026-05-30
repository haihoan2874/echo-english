import React, { useState, useMemo } from 'react';
import { useVocabStore } from '../store/vocabStore';
import { Trash2, Volume2, RotateCcw, Check, X, BookOpen, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

// ────────────────────────────────────────────────────────────
// FlashCard Component (lật thẻ 3D)
// ────────────────────────────────────────────────────────────
const FlashCard = ({ vocab, onKnow, onDontKnow }) => {
  const [flipped, setFlipped] = useState(false);

  const handleSpeak = (e) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(vocab.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col items-center w-full px-4">
      {/* Card Flip Container */}
      <div
        className="w-full max-w-sm cursor-pointer select-none"
        style={{ perspective: '1200px', height: '260px' }}
        onClick={() => setFlipped(!flipped)}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front: Từ tiếng Anh */}
          <div
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-4 border border-slate-700"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Tiếng Anh</p>
            <h2 className="text-4xl font-extrabold text-white capitalize text-center px-6">{vocab.word}</h2>
            <button
              onClick={handleSpeak}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors text-sm font-medium"
            >
              <Volume2 size={16} />
              Nghe phát âm
            </button>
            <p className="text-slate-500 text-xs mt-2">Chạm để xem nghĩa</p>
          </div>

          {/* Back: Nghĩa tiếng Việt */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-3 border border-blue-500 p-6"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-blue-200">Nghĩa tiếng Việt</p>
            <h2 className="text-3xl font-extrabold text-white text-center">{vocab.definition}</h2>
            {vocab.context && (
              <p className="text-blue-200 text-sm italic text-center mt-1 line-clamp-2">"{vocab.context}"</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`flex gap-4 mt-8 w-full max-w-sm transition-all duration-300 ${flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button
          onClick={() => { setFlipped(false); onDontKnow(); }}
          className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 font-bold py-4 rounded-2xl hover:bg-red-500/30 transition-all active:scale-95 text-base"
        >
          <X size={20} />
          Chưa nhớ
        </button>
        <button
          onClick={() => { setFlipped(false); onKnow(); }}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30 font-bold py-4 rounded-2xl hover:bg-green-500/30 transition-all active:scale-95 text-base"
        >
          <Check size={20} />
          Nhớ rồi!
        </button>
      </div>

      {!flipped && (
        <button
          onClick={() => setFlipped(true)}
          className="mt-6 bg-white text-slate-800 font-bold px-8 py-4 rounded-2xl shadow-lg hover:bg-slate-50 transition-all active:scale-95 w-full max-w-sm"
        >
          Xem đáp án
        </button>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// Flashcard Mode: full session
// ────────────────────────────────────────────────────────────
const FlashcardMode = ({ vocabList, onExit }) => {
  const [queue, setQueue] = useState(() => [...vocabList].sort(() => Math.random() - 0.5));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [done, setDone] = useState(false);

  const total = vocabList.length;
  const progress = Math.round((currentIdx / total) * 100);

  const advance = (knew) => {
    if (knew) {
      setKnownCount(p => p + 1);
    } else {
      // Put this card at the end to review again
      setQueue(q => {
        const newQ = [...q];
        const card = newQ[currentIdx];
        newQ.push(card);
        return newQ;
      });
    }

    if (currentIdx + 1 >= queue.length && knew) {
      setDone(true);
    } else {
      setCurrentIdx(i => i + 1);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Ôn tập xong rồi!</h2>
        <p className="text-slate-500 mb-8">Bạn đã nhớ <span className="font-bold text-green-600">{knownCount}/{total}</span> từ vựng hôm nay.</p>
        <button
          onClick={onExit}
          className="bg-slate-900 text-white font-bold py-4 px-10 rounded-2xl hover:bg-black transition-colors shadow-lg active:scale-95"
        >
          Quay về Sổ tay
        </button>
      </div>
    );
  }

  const currentCard = queue[currentIdx];

  return (
    <div className="flex flex-col h-full bg-slate-50 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4 shrink-0">
        <button onClick={onExit} className="text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm">
          ← Thoát
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-700">{Math.min(currentIdx + 1, queue.length)} / {queue.length}</p>
          <p className="text-xs text-slate-400">Nhớ rồi: {knownCount}</p>
        </div>
        <button
          onClick={() => { setQueue(q => [...q].sort(() => Math.random() - 0.5)); setCurrentIdx(0); setKnownCount(0); setDone(false); }}
          className="text-slate-500 hover:text-slate-800 transition-colors p-1"
          title="Xáo bài lại"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-slate-200 mx-4 rounded-full overflow-hidden shrink-0">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center pt-6">
        {currentCard && (
          <FlashCard
            key={currentCard.id}
            vocab={currentCard}
            onKnow={() => advance(true)}
            onDontKnow={() => advance(false)}
          />
        )}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// VocabPage: main
// ────────────────────────────────────────────────────────────
const VocabPage = () => {
  const { vocabList, removeVocab } = useVocabStore();
  const [mode, setMode] = useState('list'); // 'list' | 'flashcard'

  const handleSpeak = (word) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRemove = (id, word) => {
    removeVocab(id);
    toast.success(`Đã xóa "${word}"`);
  };

  if (mode === 'flashcard') {
    if (vocabList.length === 0) {
      setMode('list');
      return null;
    }
    return (
      <FlashcardMode
        vocabList={vocabList}
        onExit={() => setMode('list')}
      />
    );
  }

  return (
    <div className="pb-24 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 pt-6 pb-4 shadow-sm sticky top-0 z-20">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Sổ tay từ vựng</h1>
            <p className="text-slate-500 text-sm mt-0.5">Đã lưu {vocabList.length} từ</p>
          </div>
          {vocabList.length > 0 && (
            <button
              onClick={() => setMode('flashcard')}
              className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all active:scale-95 text-sm"
            >
              <Brain size={18} />
              Ôn tập
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {vocabList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm mt-4">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">Chưa có từ vựng nào.</p>
            <p className="text-sm text-slate-400 mt-1">Nhấn vào từ bất kỳ trong bài học để lưu lại!</p>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {vocabList.map((vocab) => (
              <div key={vocab.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-800 capitalize">{vocab.word}</h3>
                    <button
                      onClick={() => handleSpeak(vocab.word)}
                      className="text-primary p-1 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(vocab.id, vocab.word)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <p className="text-slate-700 font-semibold mb-2">{vocab.definition}</p>

                {vocab.context && (
                  <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-500 italic">"{vocab.context}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabPage;
