import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { ChevronLeft, Plus, X, Loader2, RefreshCcw, Headphones, Mic, MicOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useVocabStore } from '../store/vocabStore';
import { useHistoryStore } from '../store/historyStore';

// Merge short transcript chunks into natural sentences
// (chunks closer than 1.5s gap are joined together)
const mergeTranscriptChunks = (chunks, gapThreshold = 1.5) => {
  if (!chunks || chunks.length === 0) return [];
  const merged = [];
  let current = { ...chunks[0] };
  
  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i];
    const gap = chunk.start - (current.start + (current.duration || 1));
    
    if (gap < gapThreshold) {
      // Merge: append text, extend duration
      current.text = current.text.trimEnd() + ' ' + chunk.text.trimStart();
      current.duration = (chunk.start + (chunk.duration || 1)) - current.start;
    } else {
      merged.push(current);
      current = { ...chunk };
    }
  }
  merged.push(current);
  return merged;
};

const DictionaryPopup = ({ word, onClose, onSave, context }) => {
  const [loading, setLoading] = useState(true);
  const [definition, setDefinition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeaning = async () => {
      try {
        setLoading(true);
        let phonetic = '';
        let enMeaning = '';
        let exampleSentence = '';
        let exampleTranslation = '';
        
        // 1. Fetch Phonetics + Example from Free Dictionary API
        try {
          const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
          const data = res.data[0];
          enMeaning = data.meanings[0]?.definitions[0]?.definition || '';
          exampleSentence = data.meanings[0]?.definitions[0]?.example || '';
          phonetic = data.phonetics?.find(p => p.text)?.text || '';
        } catch (e) {
          // Ignore if english dict fails
        }

        // 2. Fetch Vietnamese Translation of the word
        let viTranslation = '';
        try {
          const transRes = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`);
          viTranslation = transRes.data?.responseData?.translatedText;
        } catch (e) {
          // Ignore
        }

        // 3. Translate example sentence to Vietnamese (only if example exists)
        if (exampleSentence) {
          try {
            const exRes = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(exampleSentence)}&langpair=en|vi`);
            exampleTranslation = exRes.data?.responseData?.translatedText || '';
          } catch (e) {
            // Ignore
          }
        }
        
        if (!viTranslation && !enMeaning) {
          throw new Error("Không tìm thấy nghĩa");
        }

        setDefinition({
          meaning: enMeaning,
          translation: viTranslation,
          phonetic: phonetic,
          example: exampleSentence,
          exampleVi: exampleTranslation,
        });
      } catch (err) {
        setError('Không tìm thấy nghĩa của từ này.');
      } finally {
        setLoading(false);
      }
    };
    
    if (word) {
      fetchMeaning();
    }
  }, [word]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] p-6 pb-8 animate-in slide-in-from-bottom duration-300">
      <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-full transition-colors">
        <X size={20} />
      </button>
      
      <div className="mb-5">
        <h3 className="text-3xl font-extrabold text-slate-900 capitalize">{word}</h3>
        {definition?.phonetic && <p className="text-primary font-semibold text-lg mt-1">{definition.phonetic}</p>}
      </div>

      <div className="min-h-[80px] bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500 font-medium">
            <Loader2 className="animate-spin mr-2" size={20} /> Đang dịch sang tiếng Việt...
          </div>
        ) : error ? (

          <p className="text-red-500 font-medium">{error}</p>
        ) : (
          <>
            {definition?.translation && (
              <p className="text-slate-800 text-xl font-bold">{definition.translation}</p>
            )}
            {definition?.meaning && (
              <p className="text-slate-500 text-sm italic border-l-2 border-slate-300 pl-3">
                {definition.meaning}
              </p>
            )}
            {definition?.example && (
              <div className="mt-1 bg-white rounded-xl p-3 border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ví dụ</p>
                <p className="text-slate-700 text-sm font-medium italic">"{definition.example}"</p>
                {definition?.exampleVi && (
                  <p className="text-primary text-sm mt-1">({definition.exampleVi})</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <button 
        onClick={() => onSave(word, definition?.translation || definition?.meaning || 'No definition', context)}
        className="mt-6 w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-slate-900/20"
      >
        <Plus size={22} />
        Lưu vào Sổ tay
      </button>
    </div>
  );
};

// Component for a blanked out word with Voice Dictation
const BlankInput = ({ correctWord, onCorrect, isLineActive }) => {
  const [val, setVal] = useState('');
  const [solved, setSolved] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const checkWord = (inputStr) => {
    const cleanCorrect = correctWord.replace(/[.,!?()[\]"']/g, '').toLowerCase();
    // Sometimes speech recognition puts periods at the end
    const cleanInput = inputStr.trim().replace(/[.,!?()[\]"']/g, '').toLowerCase();
    
    if (cleanInput.includes(cleanCorrect) || cleanCorrect === cleanInput) {
      setSolved(true);
      onCorrect();
    }
  };

  const handleListen = (e) => {
    e.stopPropagation();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Trình duyệt không hỗ trợ nhận diện giọng nói. Hãy dùng Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setVal(speechResult);
      checkWord(speechResult);
    };

    recognition.onspeechend = () => {
      recognition.stop();
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
    };

    recognition.start();
  };

  return solved ? (
    <span className="text-green-400 font-bold underline decoration-2 underline-offset-4">{correctWord}</span>
  ) : (
    <div className="inline-flex items-center mx-1 bg-slate-800 rounded px-1 border-b-2 border-slate-600 transition-all focus-within:border-yellow-400">
      <input
        type="text"
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          checkWord(e.target.value);
        }}
        placeholder={isLineActive ? (isListening ? "Đang nghe..." : "Gõ/Đọc") : "..."}
        className={`bg-transparent text-center text-yellow-300 font-bold outline-none transition-all ${
          isLineActive ? 'w-24' : 'w-12'
        }`}
        onClick={(e) => e.stopPropagation()}
      />
      {isLineActive && (
        <button 
          onClick={handleListen}
          className={`p-1 rounded-full transition-colors ml-1 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-yellow-400 hover:bg-slate-700'}`}
          title="Đọc từ vựng"
        >
          {isListening ? <Mic size={16} /> : <MicOff size={16} />}
        </button>
      )}
    </div>
  );
};

const LessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  
  const [transcript, setTranscript] = useState([]);
  const [loadingTranscript, setLoadingTranscript] = useState(true);
  const [transcriptError, setTranscriptError] = useState('');
  
  const [videoMeta, setVideoMeta] = useState({ title: null, thumbnail: null });
  
  const [currentTime, setCurrentTime] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const [selectedWord, setSelectedWord] = useState(null);
  const [currentContext, setCurrentContext] = useState('');
  
  // Practice Mode
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [pausedForDictation, setPausedForDictation] = useState(false);
  const solvedLinesRef = useRef(new Set()); // Keep track of lines where the user has solved the blank
  
  const addVocab = useVocabStore(state => state.addVocab);
  const { addOrUpdateVideo, getProgress } = useHistoryStore();

  // Translation: cache by lineId to avoid redundant API calls
  const translationCache = useRef({});
  const [activeTranslation, setActiveTranslation] = useState('');

  // Pick a random long word for each line to blank out
  const blankedWordsMap = useMemo(() => {
    const map = new Map();
    if (!isPracticeMode) return map;
    
    transcript.forEach(line => {
      const words = line.text.split(' ');
      // Find words with length > 4
      const candidates = words.map((w, i) => ({w, i})).filter(item => item.w.replace(/[.,!?]/g, '').length > 4);
      if (candidates.length > 0) {
        // Pick random
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        map.set(line.id, chosen.i);
      }
    });
    return map;
  }, [transcript, isPracticeMode]);

  // Helper: fetch and cache one line silently (no UI update)
  const prefetchTranslation = (line) => {
    if (!line || translationCache.current[line.id]) return;
    translationCache.current[line.id] = '__loading__'; // mark as in-flight
    axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(line.text)}&langpair=en|vi`)
      .then(res => {
        const translated = res.data?.responseData?.translatedText || '';
        translationCache.current[line.id] = translated;
      })
      .catch(() => { delete translationCache.current[line.id]; });
  };

  // Auto-translate active line + pre-fetch next 4 lines
  useEffect(() => {
    if (activeIndex < 0 || !transcript[activeIndex]) return;
    const line = transcript[activeIndex];

    // Show immediately if cached (and not still loading)
    const cached = translationCache.current[line.id];
    if (cached && cached !== '__loading__') {
      setActiveTranslation(cached);
    } else if (!cached) {
      // Current line not cached yet — fetch now and show when ready
      setActiveTranslation('');
      translationCache.current[line.id] = '__loading__';
      axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(line.text)}&langpair=en|vi`)
        .then(res => {
          const translated = res.data?.responseData?.translatedText || '';
          translationCache.current[line.id] = translated;
          setActiveTranslation(translated);
        })
        .catch(() => { delete translationCache.current[line.id]; });
    }

    // Pre-fetch next 4 lines silently so they're ready instantly
    [1, 2, 3, 4].forEach(offset => prefetchTranslation(transcript[activeIndex + offset]));
  }, [activeIndex, transcript]);

  // Fetch Transcript
  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        // Fetch Video Meta
        axios.get(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`)
          .then(res => {
            if (res.data && res.data.title) {
              setVideoMeta({ title: res.data.title, thumbnail: res.data.thumbnail_url });
            }
          }).catch(() => {});

        setLoadingTranscript(true);
        // Call relative API path which will be proxied by Vite (local) or Vercel (production)
        const res = await axios.get(`/api/transcript/${id}`, {
          headers: { 'Bypass-Tunnel-Reminder': 'true' }
        });
        if (res.data.success) {
          // Merge short chunks into natural sentences before storing
          const merged = mergeTranscriptChunks(res.data.data, 1.5);
          setTranscript(merged);
        } else {
          setTranscriptError(res.data.message);
        }
      } catch (err) {
        setTranscriptError('Không thể tải phụ đề từ video này. Có thể video không có phụ đề CC (chỉ có phụ đề gắn cứng vào hình), hoặc bị YouTube giới hạn máy chủ.');
      } finally {
        setLoadingTranscript(false);
      }
    };
    fetchTranscript();
  }, [id]);

  // Sync Progress
  useEffect(() => {
    const interval = setInterval(async () => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = await playerRef.current.getCurrentTime();
        setCurrentTime(time);
        
        if (Math.floor(time) % 5 === 0 && Math.floor(time) > 0) {
           addOrUpdateVideo(id, videoMeta.title, videoMeta.thumbnail, time);
        }
        
        // Find active line: The line whose start time has passed, but the NEXT line hasn't started yet.
        // This prevents the subtitle from "blinking" or disappearing during gaps/silences.
        let newIndex = -1;
        for (let i = 0; i < transcript.length; i++) {
          if (time >= transcript[i].start) {
            newIndex = i;
          } else {
            break; // Since transcript is sorted by time, we can stop early
          }
        }
        
        if (newIndex !== -1 && newIndex !== activeIndex) {
          setActiveIndex(newIndex);
          // Auto scroll
          const activeEl = document.getElementById(`line-${newIndex}`);
          if (activeEl && containerRef.current) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          
          // Dictation logic
          if (isPracticeMode && blankedWordsMap.has(transcript[newIndex].id) && !solvedLinesRef.current.has(transcript[newIndex].id)) {
            // Pause the video to wait for user to type/speak
            if (playerRef.current.pauseVideo && !pausedForDictation) {
              playerRef.current.pauseVideo();
              setPausedForDictation(true);
            }
          }
        }
      }
    }, 50);
    return () => clearInterval(interval);
  }, [transcript, activeIndex, id, isPracticeMode, blankedWordsMap, pausedForDictation, addOrUpdateVideo, videoMeta]);

  const handleWordClick = (word, sentence) => {
    if (isPracticeMode) return; // Disable click-to-translate in practice mode
    const cleanWord = word.replace(/[.,!?()[\]"']/g, '');
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }
    setSelectedWord(cleanWord);
    setCurrentContext(sentence);
  };

  const handleLineClick = (start) => {
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(start);
      playerRef.current.playVideo();
      setPausedForDictation(false);
    }
  };

  const handleDictationCorrect = (lineId) => {
    solvedLinesRef.current.add(lineId);
    setPausedForDictation(false);
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo();
    }
  };

  const handleSaveVocab = (word, def, context) => {
    addVocab(word, def, context);
    setSelectedWord(null);
    toast.success(`Đã lưu "${word}" vào Sổ tay!`);
  };

  const handlePlayerReady = (e) => {
    playerRef.current = e.target;
    // Resume from history
    const savedTime = getProgress(id);
    if (savedTime > 2) { // Only resume if watched more than 2s
      e.target.seekTo(savedTime);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 h-14 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-300 hover:text-white transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-semibold ml-2 line-clamp-1">Phòng học VIP</h1>
        </div>
        
        {/* Practice Toggle */}
        <button 
          onClick={() => {
            setIsPracticeMode(!isPracticeMode);
            solvedLinesRef.current.clear();
            setPausedForDictation(false);
            if (playerRef.current && playerRef.current.playVideo) playerRef.current.playVideo();
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            isPracticeMode ? 'bg-yellow-500 text-slate-900 shadow-md shadow-yellow-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          <Headphones size={14} />
          Luyện nghe điền từ
        </button>
      </header>

      {/* Video Player */}
      <div className="w-full aspect-video bg-black shrink-0 shadow-xl z-10 relative border-b border-slate-800">
        <YouTube
          videoId={id}
          onReady={handlePlayerReady}
          opts={{
            width: '100%',
            height: '100%',
            playerVars: {
              autoplay: 1,
              controls: 1,
              rel: 0,
              modestbranding: 1,
              cc_load_policy: 0,
              iv_load_policy: 3
            }
          }}
          className="w-full h-full absolute inset-0"
          iframeClassName="w-full h-full"
        />
        {pausedForDictation && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
            Video đang dừng. Hãy điền từ để tiếp tục!
          </div>
        )}
      </div>

      {/* Transcript Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-32 bg-slate-900" ref={containerRef}>
        {loadingTranscript ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <Loader2 className="animate-spin" size={32} />
            <p>Đang trích xuất phụ đề...</p>
          </div>
        ) : transcriptError ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 text-center px-4">
            <div className="bg-red-500/10 p-4 rounded-full">
              <X className="text-red-500 w-8 h-8" />
            </div>
            <p className="text-red-400 font-medium">{transcriptError}</p>
            <button onClick={() => window.location.reload()} className="flex items-center gap-2 mt-4 bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 text-white transition-colors">
              <RefreshCcw size={16} /> Thử lại
            </button>
          </div>
        ) : (
          <div className="space-y-6 max-w-2xl mx-auto py-8">
            {transcript.map((line, index) => {
              const isActive = index === activeIndex;
              const blankIndex = blankedWordsMap.get(line.id);
              
              return (
                <div 
                  key={line.id} 
                  id={`line-${index}`}
                  className={`group relative text-base md:text-lg leading-relaxed transition-all duration-300 px-4 py-2 rounded-2xl cursor-pointer flex items-start gap-3 ${
                    isActive 
                      ? 'text-white font-bold bg-white/10 scale-105 shadow-lg' 
                      : 'text-slate-500 font-medium hover:text-slate-300'
                  }`}
                  onClick={() => handleLineClick(line.start)}
                >
                  {/* Play/Seek Button Indicator */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLineClick(line.start);
                    }}
                    className={`mt-1.5 shrink-0 transition-opacity p-1 rounded-full bg-slate-800 hover:bg-primary hover:text-white ${isActive ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-100 text-slate-500'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  </button>

                  <div className="flex-1">
                    <div>
                      {line.text.split(' ').map((word, i) => {
                        // Blank out word if in practice mode
                        if (isPracticeMode && blankIndex === i) {
                          return <BlankInput 
                                   key={i} 
                                   correctWord={word} 
                                   isLineActive={isActive}
                                   onCorrect={() => handleDictationCorrect(line.id)} 
                                 />
                        }
                        
                        return (
                          <span 
                            key={i} 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWordClick(word, line.text);
                            }}
                            className={`inline-block px-1 rounded transition-colors ${
                              !isPracticeMode && isActive ? 'hover:bg-primary/40 hover:text-white' : 
                              !isPracticeMode ? 'hover:bg-slate-700 hover:text-white' : ''
                            }`}
                          >
                            {word}{' '}
                          </span>
                        )
                      })}
                    </div>
                    
                    {/* Vietnamese translation - only for active line */}
                    {isActive && activeTranslation && (
                      <p className="text-sky-400/80 text-sm font-normal mt-1.5 animate-in fade-in duration-300">
                        {activeTranslation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Popup Overlay */}
      {selectedWord && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" 
            onClick={() => {
              setSelectedWord(null);
              if (playerRef.current && playerRef.current.playVideo && !pausedForDictation) {
                playerRef.current.playVideo();
              }
            }}
          />
          <DictionaryPopup 
            word={selectedWord} 
            context={currentContext}
            onClose={() => {
              setSelectedWord(null);
              if (playerRef.current && playerRef.current.playVideo && !pausedForDictation) {
                playerRef.current.playVideo();
              }
            }}
            onSave={handleSaveVocab}
          />
        </>
      )}
    </div>
  );
};

export default LessonPage;
