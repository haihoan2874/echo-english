import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import { Rocket, Settings } from 'lucide-react';

import StatCards from '../components/home/StatCards';
import LinkInputForm from '../components/home/LinkInputForm';
import PlaylistView from '../components/home/PlaylistView';
import HistoryCarousel from '../components/home/HistoryCarousel';
import HeatmapGraph from '../components/home/HeatmapGraph';
import PlaylistModal from '../components/modals/PlaylistModal';
import SettingsModal from '../components/modals/SettingsModal';

const HomePage = () => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingVideo, setPendingVideo] = useState(null);
  
  const headerRef = useRef();

  useGSAP(() => {
    gsap.from(headerRef.current, {
      y: -20,
      opacity: 0,
      duration: 0.6,
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
    <div className="pb-24 bg-[#F8F9FA] min-h-[100dvh] flex flex-col">
      
      {/* Minimal Header Section */}
      <div className="sticky top-0 z-40 bg-[#F8F9FA]/80 backdrop-blur-xl border-b border-slate-200/50">
        <div ref={headerRef} className="px-5 pt-8 pb-5 max-w-md mx-auto w-full flex items-center justify-between">
          <div>
            <h1 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Tổng quan</h1>
            <p className="text-2xl font-extrabold tracking-tight text-slate-900">EchoEnglish.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSettingsOpen(true)}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Settings size={18} />
            </button>
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shadow-md shadow-slate-900/10">
               <Rocket size={18} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 px-5 max-w-md mx-auto w-full pt-6 space-y-10">
        <StatCards />
        
        <HeatmapGraph />
        
        <LinkInputForm 
          url={url} 
          setUrl={setUrl} 
          loading={loading} 
          onSubmit={handleAddClick} 
          error={error} 
        />
        
        <HistoryCarousel />
        <PlaylistView />
      </div>
      
      <PlaylistModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        videoData={pendingVideo} 
      />

      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};

export default HomePage;
