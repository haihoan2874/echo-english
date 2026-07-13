import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { useVocabStore } from '../../store/vocabStore';
import toast from 'react-hot-toast';

// Basic list of stop words to filter out
const STOP_WORDS = new Set([
  'the','a','an','and','or','but','if','because','as','what','when','where','who','whom',
  'this','that','these','those','am','is','are','was','were','be','been','being','have',
  'has','had','do','does','did','will','would','shall','should','can','could','may','might',
  'must','ought','i','you','he','she','it','we','they','me','him','her','us','them','my',
  'your','his','its','our','their','mine','yours','hers','ours','theirs','in','on','at',
  'to','for','with','about','against','between','into','through','during','before','after',
  'above','below','from','up','down','out','off','over','under','again','further','then',
  'once','here','there','all','any','both','each','few','more','most','other','some','such',
  'no','nor','not','only','own','same','so','than','too','very','just','now','how','why',
  'which','like','much','many','well','good','bad','know','think','say','see','get','make',
  'go','take','come','want','look','use','find','give','tell','work','call','try','ask',
  'need','feel','become','leave','put','mean','keep','let','begin','seem','help','talk',
  'turn','start','show','hear','play','run','move','live','believe','hold','bring','happen'
]);

const MagicScannerModal = ({ isOpen, onClose, transcript }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [results, setResults] = useState([]);
  const [selectedWords, setSelectedWords] = useState(new Set());
  
  const { addVocab, vocabList } = useVocabStore();

  useEffect(() => {
    if (!isOpen) return;
    
    setIsScanning(true);
    setResults([]);
    setSelectedWords(new Set());

    // Fake delay for "Magic" scanning effect
    const timer = setTimeout(() => {
      const wordCounts = {};
      const contextMap = {};
      
      transcript.forEach(line => {
        // Split by non-word characters but keep internal apostrophes if possible
        const words = line.text.split(/[\s.,!?()[\]"';:]+/);
        words.forEach(w => {
          const clean = w.toLowerCase().trim();
          // Filter: length > 4, not a number, not in stop words
          if (clean.length > 4 && !STOP_WORDS.has(clean) && isNaN(clean)) {
            wordCounts[clean] = (wordCounts[clean] || 0) + 1;
            if (!contextMap[clean]) contextMap[clean] = line.text; // save first context found
          }
        });
      });
      
      // Sort by length/complexity or frequency. Here we prioritize longer words + frequency
      const sortedWords = Object.keys(wordCounts)
        .sort((a, b) => {
          // Weight: length * 2 + frequency
          const scoreA = (a.length * 2) + wordCounts[a];
          const scoreB = (b.length * 2) + wordCounts[b];
          return scoreB - scoreA;
        })
        .slice(0, 15); // Top 15 suggestions
        
      const scanResults = sortedWords.map(w => ({
        word: w,
        context: contextMap[w],
        isAlreadySaved: vocabList.some(v => v.word.toLowerCase() === w)
      }));
      
      setResults(scanResults);
      
      // Auto-select all not-saved words
      const defaultSelected = new Set();
      scanResults.forEach(r => {
        if (!r.isAlreadySaved) defaultSelected.add(r.word);
      });
      setSelectedWords(defaultSelected);
      
      setIsScanning(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [isOpen, transcript, vocabList]);

  if (!isOpen) return null;

  const toggleSelect = (word) => {
    const newSet = new Set(selectedWords);
    if (newSet.has(word)) {
      newSet.delete(word);
    } else {
      newSet.add(word);
    }
    setSelectedWords(newSet);
  };

  const handleSave = () => {
    let savedCount = 0;
    results.forEach(item => {
      if (selectedWords.has(item.word)) {
        // Provide a default empty definition so user can edit later
        addVocab(item.word, '...', item.context);
        savedCount++;
      }
    });
    
    if (savedCount > 0) {
      toast.success(`Đã lưu ${savedCount} từ vựng từ Video!`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles size={20} className="animate-pulse" />
            <h2 className="text-lg font-black tracking-tight text-slate-900">Magic Scanner</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isScanning ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <Loader2 size={40} className="text-indigo-500 animate-spin relative z-10" />
              </div>
              <p className="text-slate-600 font-bold animate-pulse text-sm">Đang trích xuất từ vựng cốt lõi...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-medium">
              Không tìm thấy từ vựng nào nổi bật trong Video này.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[13px] font-medium text-slate-500 mb-4 px-1">
                Phát hiện <strong className="text-slate-900">{results.length}</strong> từ vựng quan trọng. Hãy chọn các từ bạn muốn lưu vào Sổ tay.
              </p>
              
              {results.map((item, idx) => {
                const isSelected = selectedWords.has(item.word);
                return (
                  <div 
                    key={idx}
                    onClick={() => !item.isAlreadySaved && toggleSelect(item.word)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      item.isAlreadySaved 
                        ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed' 
                        : isSelected 
                          ? 'border-indigo-500 bg-indigo-50/50' 
                          : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      item.isAlreadySaved ? 'border-slate-300 bg-slate-200' :
                      isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                    }`}>
                      {(isSelected || item.isAlreadySaved) && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-base truncate capitalize">{item.word}</h4>
                        {item.isAlreadySaved && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide bg-slate-200 px-1.5 py-0.5 rounded">Đã lưu</span>}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5 italic">"{item.context}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!isScanning && results.length > 0 && (
          <div className="p-5 border-t border-slate-100 shrink-0 bg-white sm:rounded-b-3xl">
            <button
              onClick={handleSave}
              disabled={selectedWords.size === 0}
              className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10"
            >
              <Sparkles size={18} />
              Lưu {selectedWords.size} từ vựng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MagicScannerModal;
