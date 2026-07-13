import React, { useRef } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const LinkInputForm = ({ url, setUrl, loading, onSubmit, error }) => {
  const formRef = useRef();

  useGSAP(() => {
    gsap.from(formRef.current, {
      y: 15,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.out',
      delay: 0.2
    });
  }, []);

  return (
    <div ref={formRef} className="w-full">
      <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 transition-all focus-within:shadow-md focus-within:border-slate-300">
        <form onSubmit={onSubmit} className="relative flex items-center">
          <div className="pl-4 text-slate-400 shrink-0">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            placeholder="Dán link YouTube để học..."
            className="w-full bg-transparent py-3.5 px-3 text-[15px] font-medium focus:outline-none text-slate-800 disabled:opacity-50 placeholder-slate-400"
          />
          <button 
            type="submit"
            disabled={loading}
            className="shrink-0 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-1.5 active:scale-95"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} /> Thêm</>}
          </button>
        </form>
        {error && <p className="text-red-500 text-xs font-medium mt-1 mb-1 px-4 animate-in slide-in-from-top-1">{error}</p>}
      </div>
    </div>
  );
};

export default LinkInputForm;
