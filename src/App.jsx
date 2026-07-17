import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LessonPage from './pages/LessonPage';
import VocabPage from './pages/VocabPage';
import AIChatPage from './pages/AIChatPage';
import { useVocabStore } from './store/vocabStore';

function App() {
  const { checkLoginDaily } = useVocabStore();

  useEffect(() => {
    checkLoginDaily();
  }, [checkLoginDaily]);

  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          duration: 3500,
          className: 'premium-toast',
          style: { 
            background: 'rgba(255, 255, 255, 0.85)', 
            color: '#0f172a',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.02)',
            borderRadius: '100px', // Pill shape for premium feel
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '700',
            letterSpacing: '-0.01em',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }} 
        containerStyle={{ top: 32 }}
      />
      
      {/* Global Watermark */}
      <div className="fixed top-2 left-0 right-0 pointer-events-none z-[9999] opacity-20 flex justify-center text-slate-400">
        <span className="text-[9px] font-bold tracking-[0.3em] uppercase">Trịnh Hải Hoàn</span>
      </div>

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="vocab" element={<VocabPage />} />
          <Route path="ai-chat" element={<AIChatPage />} />
        </Route>
        <Route path="/lesson/:id" element={<LessonPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
