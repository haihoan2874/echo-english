import React, { useState } from 'react';
import { X, Settings, Trash2, AlertTriangle, Play } from 'lucide-react';
import { useVocabStore } from '../../store/vocabStore';
import { useHistoryStore } from '../../store/historyStore';
import toast from 'react-hot-toast';

const SettingsModal = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetAllData } = useVocabStore();
  const { clearHistory } = useHistoryStore();
  
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSpeedChange = (e) => {
    updateSettings({ voiceSpeed: parseFloat(e.target.value) });
  };

  const handleTestVoice = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("Welcome to Echo English.");
    utterance.lang = 'en-US';
    utterance.rate = settings.voiceSpeed;
    
    // Select Google US English if available
    const voices = window.speechSynthesis.getVoices();
    const googleVoice = voices.find(v => v.name === 'Google US English' || v.name === 'English (United States)');
    if (googleVoice) utterance.voice = googleVoice;

    window.speechSynthesis.speak(utterance);
  };

  const handleResetData = () => {
    resetAllData();
    clearHistory();
    toast.success('Đã khôi phục cài đặt gốc thành công!');
    setShowConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 flex flex-col animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900">
            <Settings size={20} />
            <h2 className="text-lg font-black tracking-tight">Cài đặt hệ thống</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-5 space-y-8">
          
          {/* Voice Speed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700">Tốc độ đọc (TTS)</label>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {settings.voiceSpeed.toFixed(2)}x
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                min="0.5" 
                max="1.5" 
                step="0.05"
                value={settings.voiceSpeed}
                onChange={handleSpeedChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <button 
                onClick={handleTestVoice}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                title="Nghe thử"
              >
                <Play size={16} fill="currentColor" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Tốc độ chuẩn là 1.0x. Khuyến nghị 0.85x để luyện nghe dễ hơn.</p>
          </div>

          <hr className="border-slate-100" />

          {/* Danger Zone */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-red-500 flex items-center gap-1.5">
              <AlertTriangle size={16} /> Danger Zone
            </label>
            
            {!showConfirm ? (
              <button 
                onClick={() => setShowConfirm(true)}
                className="w-full py-3 px-4 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={18} /> Xóa toàn bộ dữ liệu học tập
              </button>
            ) : (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-sm text-red-800 font-medium">Hành động này sẽ xóa sạch: Từ vựng, XP, Chuỗi ngày, Lịch sử video. Không thể hoàn tác!</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-2 bg-white text-slate-600 font-bold rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleResetData}
                    className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md shadow-red-600/20"
                  >
                    Chắc chắn Xóa
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
