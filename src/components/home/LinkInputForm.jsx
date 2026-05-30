import React, { useRef } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const LinkInputForm = ({ url, setUrl, loading, onSubmit, error }) => {
  const formRef = useRef();

  useGSAP(() => {
    gsap.from(formRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      delay: 0.4
    });
  }, []);

  return (
    <div ref={formRef} className="px-4 max-w-md mx-auto -mt-6 relative z-50">
      <div className="bg-white p-2 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-slate-100 transition-all focus-within:shadow-[0_10px_40px_rgba(0,0,0,0.12)] focus-within:border-primary/30">
        <form onSubmit={onSubmit} className="relative flex items-center">
          <div className="pl-3 text-slate-400 shrink-0">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            placeholder="Dán link YouTube..."
            className="w-full bg-transparent py-3 px-3 text-sm focus:outline-none text-slate-700 disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={loading}
            className="shrink-0 bg-primary text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-1 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} /> Thêm</>}
          </button>
        </form>
        {error && <p className="text-red-500 text-xs mt-2 px-3 pb-1 animate-in slide-in-from-top-2">{error}</p>}
      </div>
    </div>
  );
};

export default LinkInputForm;
