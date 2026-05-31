import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Volume2, Loader2, Send } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useChatStore } from '../store/chatStore';

const getSystemInstruction = (level) => `You are a friendly, encouraging English conversation partner for an English learner. 
Your primary goal is to KEEP THE CONVERSATION GOING and ENCOURAGE THE USER TO SPEAK.
Rules:
1. Always ask ONE engaging, simple follow-up question at the end of your response to prompt the user to answer.
2. Keep your responses extremely short (max 2-3 short sentences).
3. The user's English level is ${level}. Use vocabulary, idioms, and grammar strictly appropriate for this level. If the level is Beginner (A1), use extremely basic daily words, very short simple sentences, and speak like you are talking to a young child learning English.
4. If they make a grammatical mistake, just naturally use the correct form in your reply, don't be a strict teacher.
5. ALWAYS speak in English. Never use Vietnamese.
6. Start by greeting them at the ${level} level and asking a very simple question.`;

const AIChatPage = () => {
  const { hasStarted, messages, level, setHasStarted, setLevel, addMessage, clearMessages, resetChat } = useChatStore();
  
  const [isListening, setIsListening] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  
  // The text input that users can edit before sending
  const [draftMessage, setDraftMessage] = useState('');
  
  const chatEndRef = useRef(null);
  const chatSessionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Removed chatSessionRef as we now use stateless backend calls

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAIThinking]);

  // Handle Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true; // Lắng nghe liên tục, không tự ngắt
      recognition.interimResults = true; // Allow interim results so user sees text as they speak
      recognition.maxAlternatives = 1;
      
      // Store final transcript safely
      let finalTranscript = '';

      recognition.onstart = () => {
        setIsListening(true);
        finalTranscript = ''; 
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (currentFinal) {
          finalTranscript += ' ' + currentFinal;
        }

        // Combine the existing draft (before we started recording this chunk), plus new speech
        // We append to whatever was already in draftMessage when recording started
        // Actually, to make it simple: just overwrite the draft with the spoken text, 
        // or append it if draft wasn't empty.
        setDraftMessage(prev => {
          // If prev is not empty and doesn't end with space, add a space
          const prefix = prev.length > 0 && !prev.endsWith(' ') ? prev + ' ' : prev;
          
          // Only update if it's a final result or we are showing interim.
          // For simplicity and less bugginess with React state in events, 
          // let's just append the final transcript when speech ends, OR use a simpler approach.
          return currentFinal ? prefix + currentFinal.trim() : prev;
        });
      };
      
      recognition.onspeechend = () => {
        // Không tự động stop() nữa để người dùng ngắc ngứ thoải mái
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
      
      setRecognitionInstance(recognition);
    } else {
      toast.error('Trình duyệt không hỗ trợ nhận diện giọng nói. Hãy dùng Chrome.');
    }

    return () => {
      synthRef.current.cancel(); 
    };
  }, []);

  // Simpler approach for STT: non-interim, just append when they stop talking
  useEffect(() => {
    if (recognitionInstance) {
       recognitionInstance.interimResults = false;
       recognitionInstance.onresult = (event) => {
         const transcript = event.results[0][0].transcript;
         setDraftMessage(prev => {
           const prefix = (prev && !prev.endsWith(' ')) ? prev + ' ' : prev;
           return prefix + transcript;
         });
       };
    }
  }, [recognitionInstance]);


  const initChat = async () => {
    setHasStarted(true);
    clearMessages();
    setIsAIThinking(true);
    
    // Save the hidden prompt to store so Gemini's history is valid when restoring
    addMessage('user', "Hello, let's start our conversation.");
    
    try {
      // Call relative API path which will be proxied by Vite (local) or Vercel (production)
      const res = await axios.post(`/api/chat`, {
        message: "Hello, let's start our conversation.",
        history: [],
        systemInstruction: getSystemInstruction(level)
      }, {
        headers: {
          'Bypass-Tunnel-Reminder': 'true',
          'ngrok-skip-browser-warning': '69420'
        }
      });
      
      if (res.data.success) {
        const aiResponseText = res.data.text;
        addMessage('ai', aiResponseText);
        speakText(aiResponseText);
      }
    } catch (error) {
      console.error("Error initializing AI:", error);
      toast.error('Lỗi kết nối tới AI. Hãy kiểm tra server.');
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleSendDraft = async (e) => {
    e?.preventDefault();
    if (!draftMessage.trim() || isAIThinking) return;
    
    const textToSend = draftMessage.trim();
    // Get history BEFORE adding the new message
    const history = messages.map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));
    
    addMessage('user', textToSend);
    setDraftMessage(''); // Clear input
    setIsAIThinking(true);
    
    // Stop listening if it was listening
    if (isListening) {
      recognitionInstance?.stop();
    }
    
    try {
      const res = await axios.post(`/api/chat`, {
        message: textToSend,
        history: history,
        systemInstruction: getSystemInstruction(level)
      }, {
        headers: {
          'Bypass-Tunnel-Reminder': 'true',
          'ngrok-skip-browser-warning': '69420'
        }
      });
      
      if (res.data.success) {
        const aiResponseText = res.data.text;
        addMessage('ai', aiResponseText);
        speakText(aiResponseText);
      } else {
        throw new Error(res.data.message);
      }
    } catch (error) {
      console.error("AI Error:", error);
      addMessage('ai', "Sorry, I'm having trouble connecting right now.");
    } finally {
      setIsAIThinking(false);
    }
  };

  const speakText = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel(); 
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    
    const voices = synthRef.current.getVoices();
    const usVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices.find(v => v.lang === 'en-US');
    if (usVoice) utterance.voice = usVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const toggleMic = (e) => {
    e?.preventDefault();
    if (isListening) {
      recognitionInstance?.stop();
    } else {
      if (isSpeaking) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
      recognitionInstance?.start();
    }
  };

  if (!hasStarted) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-900 overflow-hidden px-5">
        {/* Decorative Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/30 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.4)] animate-[pulse_3s_ease-in-out_infinite]">
            <Volume2 className="text-white" size={48} />
          </div>
          
          <h1 className="text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-center tracking-tight">AI English Tutor</h1>
          <p className="text-slate-300 text-center mb-10 font-medium">Giao tiếp tiếng Anh tự nhiên. Không lo ngắt lời!</p>
          
          <div className="w-full bg-white/5 backdrop-blur-xl p-7 rounded-[2rem] mb-8 border border-white/10 shadow-2xl">
            <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest text-center">Trình độ của bạn</p>
            <div className="space-y-3">
              {['Beginner (A1)', 'Pre-Intermediate (A2)', 'Intermediate (B1)', 'Advanced (B2)'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 font-semibold ${
                    level === lvl 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02] border-transparent' 
                      : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:scale-[1.01]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={initChat}
            className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl hover:bg-slate-100 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] text-lg"
          >
            Bắt đầu trò chuyện
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-[100px]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 text-slate-800 px-4 h-16 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <h1 className="font-bold text-lg flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          <Volume2 className="text-blue-600 animate-pulse" size={20} />
          AI Tutor
        </h1>
        
        <button 
          onClick={() => {
            synthRef.current?.cancel();
            resetChat();
            toast.success('Đã kết thúc cuộc trò chuyện');
          }}
          className="px-4 py-2 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-100 transition-colors text-sm font-bold flex items-center gap-1.5"
        >
          <Square size={14} className="fill-current" />
          Kết thúc
        </button>
      </header>

      {/* Chat Area */}
      <div className="p-4 space-y-6 mb-24">
        {messages.filter(m => !(m.role === 'user' && m.text === "Hello, let's start our conversation.")).map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] px-5 py-3.5 text-[15px] sm:text-base leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-white border border-slate-200/60 text-slate-700 rounded-2xl rounded-tl-sm shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {isAIThinking && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200/60 rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm flex items-center gap-2.5 text-slate-500 text-sm font-medium">
              <Loader2 size={16} className="animate-spin text-blue-500" /> AI đang suy nghĩ...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Control Area */}
      <div className="fixed bottom-[64px] left-0 right-0 p-3 z-20 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto bg-white/90 backdrop-blur-xl border border-slate-200/60 p-3 rounded-3xl shadow-[0_-5px_40px_rgba(0,0,0,0.08)]">
          
          {/* Status text */}
          <div className="text-[11px] font-bold tracking-wide uppercase text-slate-400 text-center px-4 mb-2 h-4 flex items-center justify-center">
            {isSpeaking ? <span className="text-blue-500 flex items-center gap-1"><Volume2 size={12}/> AI đang nói...</span> : isListening ? <span className="text-red-500 animate-pulse flex items-center gap-1"><Mic size={12}/> Đang nghe... (Bấm Mic để gửi)</span> : ''}
          </div>

          <form onSubmit={handleSendDraft} className="flex gap-2 items-end">
            <button 
              type="button"
              onClick={toggleMic}
              className={`p-3.5 rounded-2xl shrink-0 transition-all duration-300 ${
                isListening 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105'
              }`}
            >
              {isListening ? <Square size={22} className="fill-current" /> : <Mic size={22} />}
            </button>
            
            <textarea
              value={draftMessage}
              onChange={(e) => setDraftMessage(e.target.value)}
              placeholder="Nói hoặc gõ phím..."
              className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
              rows="1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendDraft();
                }
              }}
              style={{ minHeight: '52px', maxHeight: '120px' }}
            />
            
            <button 
              type="submit"
              disabled={!draftMessage.trim() || isAIThinking}
              className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shrink-0 hover:opacity-90 disabled:opacity-50 disabled:from-slate-300 disabled:to-slate-300 transition-all shadow-lg shadow-blue-500/25 disabled:shadow-none hover:scale-105 active:scale-95"
            >
              <Send size={22} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
