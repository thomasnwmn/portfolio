'use client';
import React from 'react';
import { useStore } from '../../hooks/useStore';
import { profileInfo } from '../../data/content';

export const HUD = () => {
  const currentView = useStore((state) => state.currentView);

  return (
    <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex justify-between items-start z-10">
      <div className="font-mono text-cyan-500 select-none">
        <h1 className="text-xl font-bold tracking-widest uppercase">{profileInfo.name}</h1>
        <p className="text-xs text-cyan-700">{profileInfo.title}</p>
        
        <div className="mt-6 flex flex-col gap-2 pointer-events-auto">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Status / Navigation</p>
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${currentView === 'idle' ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-700'}`}></span>
            <span className={currentView === 'idle' ? 'text-cyan-400' : 'text-slate-500'}>System Idle</span>
          </div>
        </div>
      </div>
      
      <div className="font-mono text-[10px] text-slate-600 text-right pointer-events-auto">
        <span className="uppercase tracking-widest">
          2D Orthographic Mode
        </span>
      </div>
    </div>
  );
};
