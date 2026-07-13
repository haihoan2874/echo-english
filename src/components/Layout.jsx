import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Mic, BookOpen } from 'lucide-react';

const Layout = () => {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center h-16 px-4">
        <NavLink 
          to="/" 
          className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-slate-400'}`}
        >
          <Home size={24} />
          <span className="text-xs font-medium">Khám phá</span>
        </NavLink>
        
        <NavLink 
          to="/ai-chat" 
          className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-slate-400'}`}
        >
          <Mic size={24} />
          <span className="text-xs font-medium">Phát âm</span>
        </NavLink>
        
        <NavLink 
          to="/vocab" 
          className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-slate-400'}`}
        >
          <BookOpen size={24} />
          <span className="text-xs font-medium">Sổ tay</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Layout;
