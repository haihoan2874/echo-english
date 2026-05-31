import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import toast from 'react-hot-toast';

import StatCards from '../components/home/StatCards';
import LinkInputForm from '../components/home/LinkInputForm';
import PlaylistView from '../components/home/PlaylistView';
import HistoryCarousel from '../components/home/HistoryCarousel';
import PlaylistModal from '../components/modals/PlaylistModal';

const LogoSVG = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
    <rect width="100" height="100" rx="24" fill="url(#paint0_linear)"/>
    <path d="M30 50C30 38.9543 38.9543 30 50 30C61.0457 30 70 38.9543 70 50" stroke="white" strokeWidth="8" strokeLinecap="round"/>
    <path d="M40 50C40 44.4772 44.4772 40 50 40C55.5228 40 60 44.4772 60 50" stroke="white" strokeWidth="8" strokeLinecap="round"/>
    <circle cx="50" cy="55" r="8" fill="white"/>
    <defs>
      <linearGradient id="paint0_linear" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
  </svg>
);

const HomePage = () => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingVideo, setPendingVideo] = useState(null);
  
  const headerRef = useRef();

  useGSAP(() => {
    gsap.from(headerRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  }, []);

  const handleAddClick = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!url.trim()) return;

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      const videoId = match[2];
      try {
        setLoading(true);
        const res = await axios.get(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        if (res.data && res.data.title) {
          setPendingVideo({ videoId, title: res.data.title, thumbnail: res.data.thumbnail_url });
        } else {
          setPendingVideo({ videoId, title: `Video ${videoId}`, thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` });
        }
        setModalOpen(true);
        setUrl('');
      } catch (err) {
        setPendingVideo({ videoId, title: `Video ${videoId}`, thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` });
        setModalOpen(true);
        setUrl('');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Link YouTube không hợp lệ.');
      toast.error('Link YouTube không hợp lệ!');
    }
  };

  return (
    <div className="pb-24 bg-slate-50 min-h-full flex flex-col relative">
      
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-40 bg-slate-50 shadow-sm">
        <div ref={headerRef} className="bg-slate-900 text-white rounded-b-[40px] px-6 pt-8 pb-12 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 max-w-md mx-auto w-full">
            <header className="mb-8 flex items-center gap-4">
              <LogoSVG />
              <div>
                <h1 className="text-xl font-medium text-slate-300">Chào mừng trở lại,</h1>
                <p className="text-3xl font-extrabold mt-1 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">EchoEnglish 🚀</p>
              </div>
            </header>

            <StatCards />
          </div>
        </div>

        <LinkInputForm 
          url={url} 
          setUrl={setUrl} 
          loading={loading} 
          onSubmit={handleAddClick} 
          error={error} 
        />
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 px-4 max-w-md mx-auto w-full pt-8 space-y-10">
        <HistoryCarousel />
        <PlaylistView />
      </div>
      
      <PlaylistModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        videoData={pendingVideo} 
      />
    </div>
  );
};

export default HomePage;
