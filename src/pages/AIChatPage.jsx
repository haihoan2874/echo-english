import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Volume2, Check, ArrowRight, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useVocabStore } from '../store/vocabStore';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

const AIChatPage = () => {
  const navigate = useNavigate();
  const { vocabList, addXP } = useVocabStore();
  
  const [hasStarted, setHasStarted] = useState(false);
  const [practiceQueue, setPracticeQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [resultStatus, setResultStatus] = useState(null); // 'success', 'fail', null
  const [hasSpeechSupport] = useState(!!SpeechRecognitionAPI);
  
  const recognitionRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (hasSpeechSupport) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          evaluateSpeech(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
          toast.error("Vui lòng cấp quyền Microphone.");
        }
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      window.speechSynthesis?.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [hasSpeechSupport, currentIndex, practiceQueue]);

  const startSession = () => {
    if (vocabList.length === 0) return;
    // Shuffle vocab list for practice
    const shuffled = [...vocabList].sort(() => 0.5 - Math.random()).slice(0, 15);
    setPracticeQueue(shuffled);
    setCurrentIndex(0);
    setResultStatus(null);
    setTranscript('');
    setHasStarted(true);
  };

  const currentVocab = practiceQueue[currentIndex];

  let currentAudio = null;
  const speakText = (text) => {
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`;
      currentAudio = new Audio(url);
      currentAudio.play().catch(e => console.error("Audio play failed:", e));
    } catch (err) {
      console.error("Audio system error:", err);
    }
  };

  const toggleMic = () => {
    if (!hasSpeechSupport) {
      toast.error("Trình duyệt không hỗ trợ Web Speech API.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setResultStatus(null);
      setTranscript('');
      window.speechSynthesis?.cancel();
      try {
        recognitionRef.current?.start();
      } catch (e) {}
    }
  };

  const evaluateSpeech = (spokenText) => {
    if (!currentVocab) return;
    
    // Convert to lowercase and remove punctuation
    const cleanSpoken = spokenText.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
    const cleanTargetWord = currentVocab.word.toLowerCase().replace(/[^\w\s]|_/g, "").trim();
    
    // Extremely forgiving check: Did they say the word itself? 
    // Or if they read the whole context sentence, does it contain the word?
    if (cleanSpoken.includes(cleanTargetWord) || cleanSpoken === cleanTargetWord) {
      setResultStatus('success');
      addXP(20); // Big reward for speaking!
      useVocabStore.getState().updateQuest('shadowing', 1);
      toast.success('+20 XP', { duration: 1500, id: 'xp-reward' });
      
      // Auto move to next after short delay
      setTimeout(() => {
        handleNext();
      }, 2000);
    } else {
      setResultStatus('fail');
    }
  };

  const handleNext = () => {
    setResultStatus(null);
    setTranscript('');
    setIsListening(false);
    
    if (currentIndex < practiceQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      
      // Add a slight pop animation
      gsap.fromTo(cardRef.current, 
        { scale: 0.95, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }
      );
    } else {
      // Session finished
      setHasStarted(false);
      toast.success('Đã hoàn thành phiên luyện giọng!');
    }
  };

  // ==============================
  // UI: START SCREEN
  // ==============================
  if (!hasStarted) {
    return (
      <div className="flex flex-col min-h-[calc(100dvh-64px)] bg-[#F8F9FA] pb-10">
        <div className="pt-10 pb-8 px-5 bg-white border-b border-slate-200/60 shadow-sm relative z-10">
          <h1 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Phòng tập</h1>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Shadowing.</h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">Luyện nhại giọng thực tế dựa trên chính Sổ tay Từ vựng của bạn. Nhanh, chuẩn và hoàn toàn offline.</p>
        </div>

        <div className="px-5 mt-10 max-w-md mx-auto w-full">
          {vocabList.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
              <AlertCircle size={40} className="mx-auto text-amber-500 mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-black text-slate-900 mb-2">Chưa có từ vựng nào</h3>
              <p className="text-slate-500 text-[13px] font-medium mb-6">Bạn cần lưu ít nhất 1 từ vựng vào Sổ tay để bắt đầu luyện phát âm.</p>
              <button 
                onClick={() => navigate('/vocab')}
                className="bg-slate-900 text-white font-bold w-full py-4 rounded-xl active:scale-[0.98] transition-transform"
              >
                Tải từ vựng ngay
              </button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Sparkles size={100} />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5">
                  <Mic size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">Sẵn sàng luyện tập</h3>
                <p className="text-slate-500 text-[13px] font-medium mb-6">Hệ thống đã chuẩn bị {Math.min(vocabList.length, 15)} từ vựng ngẫu nhiên từ Sổ tay của bạn.</p>
                
                <button 
                  onClick={startSession}
                  className="bg-slate-900 text-white font-bold w-full py-4 rounded-xl active:scale-[0.98] transition-transform shadow-md flex items-center justify-center gap-2"
                >
                  <Mic size={18} /> Bắt đầu thu âm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==============================
  // UI: STUDIO SCREEN
  // ==============================
  return (
    <div className="flex flex-col min-h-[calc(100dvh-64px)] bg-slate-900 text-white overflow-hidden relative">
      {/* Header */}
      <header className="px-5 h-16 flex items-center justify-between border-b border-slate-800 shrink-0">
        <button 
          onClick={() => setHasStarted(false)} 
          className="text-slate-400 hover:text-white text-[11px] font-bold uppercase tracking-wider"
        >
          ← Dừng
        </button>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          {currentIndex + 1} / {practiceQueue.length}
        </span>
        <div className="w-10"></div>
      </header>

      {/* Main Card */}
      <div className="flex-1 flex flex-col items-center justify-center p-5 relative z-10">
        
        {/* Flashcard */}
        <div ref={cardRef} className="w-full max-w-sm bg-white text-slate-900 p-8 rounded-[2rem] shadow-2xl relative">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">Nghe mẫu và Đọc lại</p>
          
          <h2 className="text-[40px] font-black text-center mb-1 tracking-tight capitalize">{currentVocab.word}</h2>
          <p className="text-center text-slate-500 font-bold mb-6">({currentVocab.definition})</p>
          
          {currentVocab.context && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 text-center">
              <p className="text-[15px] font-medium italic text-slate-600 leading-relaxed">"{currentVocab.context}"</p>
            </div>
          )}

          <button 
            onClick={() => speakText(currentVocab.context || currentVocab.word)}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl active:scale-95 transition-all"
          >
            <Volume2 size={18} /> Nghe Audio Mẫu
          </button>
        </div>

        {/* Feedback Section */}
        <div className="mt-8 h-24 w-full max-w-sm flex flex-col items-center justify-center text-center">
          {isListening && (
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
              </div>
              <p className="text-red-400 font-bold text-sm">Đang nghe...</p>
            </div>
          )}

          {!isListening && resultStatus === 'success' && (
            <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                <Check size={24} className="text-white stroke-[3]" />
              </div>
              <p className="text-green-400 font-black text-lg">Chính xác! (+20 XP)</p>
            </div>
          )}

          {!isListening && resultStatus === 'fail' && (
            <div className="flex flex-col items-center gap-1.5 animate-in slide-in-from-bottom-4">
               <p className="text-amber-400 font-bold text-sm">Chưa khớp lắm, bạn đã đọc là:</p>
               <p className="text-white italic text-lg font-medium opacity-80">"{transcript}"</p>
               <p className="text-slate-400 text-[11px] uppercase tracking-wider mt-1">Hãy thử lại!</p>
            </div>
          )}
        </div>
      </div>

      {/* Mic Controls */}
      <div className="p-5 pb-10 flex justify-center items-center gap-6 relative z-10 w-full max-w-sm mx-auto">
        <div className="w-14"></div> {/* Spacer for balance */}
        
        <button 
          onClick={toggleMic}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 shadow-red-500/40 scale-110' 
              : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
          }`}
        >
          {isListening ? <Square size={32} className="fill-current" /> : <Mic size={36} />}
        </button>

        <div className="w-14 flex justify-end">
          <button 
            onClick={handleNext}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all ${
              resultStatus === 'success' 
                ? 'bg-white text-slate-900 animate-bounce' 
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
            title={resultStatus === 'success' ? "Tiếp theo" : "Bỏ qua"}
          >
            <ArrowRight size={24} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default AIChatPage;
