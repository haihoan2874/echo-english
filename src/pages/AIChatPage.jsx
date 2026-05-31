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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await axios.post(`${apiUrl}/api/chat`, {
        message: "Hello, let's start our conversation.",
        history: [],
        systemInstruction: getSystemInstruction(level)
      }, {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await axios.post(`${apiUrl}/api/chat`, {
        message: textToSend,
        history: history,
        systemInstruction: getSystemInstruction(level)
      }, {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
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
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6 pb-24">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
          <Volume2 className="text-primary" size={40} />
        </div>
        <h1 className="text-3xl font-extrabold mb-2 text-center">AI English Tutor</h1>
        <p className="text-slate-400 text-center mb-10 max-w-xs">Giao tiếp tiếng Anh tự nhiên với AI. Không lo bị ngắt lời!</p>
        
        <div className="bg-slate-800 p-6 rounded-3xl w-full max-w-sm mb-8 border border-slate-700 shadow-xl">
          <p className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Trình độ của bạn</p>
          <div className="space-y-2">
            {['Beginner (A1)', 'Pre-Intermediate (A2)', 'Intermediate (B1)', 'Advanced (B2)'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium border ${
                  level === lvl 
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={initChat}
          className="w-full max-w-sm bg-white text-slate-900 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors shadow-xl"
        >
          Bắt đầu nói chuyện
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-[100px]">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 h-16 flex items-center justify-between shadow-md sticky top-0 z-40">
        <h1 className="font-bold text-lg flex items-center gap-2">
          <Volume2 className="text-primary animate-pulse" size={20} />
          AI English Tutor
        </h1>
        
        <button 
          onClick={() => {
            synthRef.current?.cancel();
            resetChat();
            toast.success('Đã kết thúc cuộc trò chuyện');
          }}
          className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors text-sm font-medium flex items-center gap-1"
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
              className={`max-w-[85%] rounded-2xl px-5 py-3 text-lg leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {isAIThinking && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-2 text-slate-500">
              <Loader2 size={18} className="animate-spin" /> AI đang suy nghĩ...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Control Area */}
      <div className="fixed bottom-[64px] left-0 right-0 bg-white p-3 border-t border-slate-100 flex flex-col gap-2 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20">
        
        {/* Status text */}
        <div className="text-xs font-medium text-slate-500 text-center px-4 -mt-1 h-4">
          {isSpeaking ? 'AI đang nói...' : isListening ? 'Đang nghe... (Nói xong tự điền vào khung dưới)' : ''}
        </div>

        <form onSubmit={handleSendDraft} className="flex gap-2 w-full max-w-md mx-auto items-end">
          <button 
            type="button"
            onClick={toggleMic}
            className={`p-3 rounded-xl shrink-0 transition-all ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse shadow-red-500/40 shadow-lg' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isListening ? <Square size={24} className="fill-current" /> : <Mic size={24} />}
          </button>
          
          <textarea
            value={draftMessage}
            onChange={(e) => setDraftMessage(e.target.value)}
            placeholder="Nói hoặc gõ phím..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:border-primary resize-none h-12"
            rows="1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendDraft();
              }
            }}
          />
          
          <button 
            type="submit"
            disabled={!draftMessage.trim() || isAIThinking}
            className="p-3 bg-primary text-white rounded-xl shrink-0 hover:bg-blue-600 disabled:opacity-50 disabled:bg-slate-300 transition-colors shadow-lg shadow-blue-500/30"
          >
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatPage;
