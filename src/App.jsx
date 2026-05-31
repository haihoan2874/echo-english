import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LessonPage from './pages/LessonPage';
import VocabPage from './pages/VocabPage';
import AIChatPage from './pages/AIChatPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: '#333', color: '#fff' } }} />
      
      {/* Global Watermark */}
      <div className="fixed top-3 right-3 pointer-events-none z-[9999] opacity-30 flex items-center gap-1.5 mix-blend-difference text-white drop-shadow-md">
        <span className="text-[10px] font-bold tracking-widest uppercase">TRỊNH HẢI HOÀN</span>
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
