'use client';
import React from 'react';
import { useStore } from '../../hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { projects, workHistory, skillsData, profileInfo } from '../../data/content';

export const OverlayManager = () => {
  const currentView = useStore((state) => state.currentView);
  const resetView = useStore((state) => state.resetView);

  const getOverlayContent = () => {
    switch (currentView) {
      case 'monitor':
        return (
          <div className="text-cyan-400 font-mono">
            <h2 className="text-2xl mb-4 border-b border-cyan-500/30 pb-2">Projects & Architecture</h2>
            <div className="space-y-6">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-slate-900/50 p-4 rounded border border-cyan-500/20">
                  <h3 className="text-xl font-bold">{proj.name}</h3>
                  <div className="flex gap-2 mt-2">
                    {proj.techStack.map(t => (
                      <span key={t} className="bg-cyan-900/50 px-2 py-1 text-xs rounded">{t}</span>
                    ))}
                  </div>
                  <p className="mt-4 text-cyan-200">Role: {proj.roleAndImpact}</p>
                  <p className="mt-2 text-cyan-200">Arch: {proj.architectureDecisions}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'notebook':
        return (
          <div className="text-slate-800 font-serif">
            <h2 className="text-2xl mb-4 border-b border-slate-300 pb-2 font-bold">Lab Journal: Work History</h2>
            <div className="space-y-6">
              {workHistory.map((role) => (
                <div key={role.id} className="bg-white/80 p-6 rounded shadow-sm border border-slate-200">
                  <h3 className="text-xl font-bold">{role.title} @ {role.company}</h3>
                  <p className="text-sm text-slate-500 mb-4">{role.dates}</p>
                  <div className="mb-2 font-semibold">Responsibilities:</div>
                  <ul className="list-disc pl-5 mb-4 text-sm space-y-1">
                    {role.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                  <div className="mb-2 font-semibold">Achievements:</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {role.achievements.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      case 'toolbox':
        return (
          <div className="text-blue-400 font-mono">
            <h2 className="text-2xl mb-4 border-b border-blue-500/30 pb-2">Technical Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skillsData.map((cat) => (
                <div key={cat.id} className="bg-slate-900/80 p-4 border border-blue-500/30 rounded">
                  <h3 className="text-lg font-bold mb-3">{cat.categoryName}</h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill) => (
                      <span key={skill} className="bg-blue-900/50 text-blue-200 px-2 py-1 text-xs rounded border border-blue-700/50">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'walkieTalkie':
        return (
          <div className="text-orange-400 font-mono text-center flex flex-col items-center justify-center h-full">
            <h2 className="text-3xl mb-2 font-bold">Contact Channel</h2>
            <p className="text-orange-200 mb-8 max-w-md">{profileInfo.bio}</p>
            <div className="flex flex-col gap-4 w-full max-w-sm">
              <a href={`mailto:${profileInfo.contact.email}`} className="bg-orange-600 hover:bg-orange-500 text-white py-3 rounded transition-colors uppercase font-bold tracking-widest text-sm">
                Transmit Message
              </a>
              <div className="flex justify-center gap-4 mt-4">
                <a href={profileInfo.contact.linkedin} target="_blank" rel="noreferrer" className="text-orange-400 hover:text-orange-300">LinkedIn</a>
                <a href={profileInfo.contact.github} target="_blank" rel="noreferrer" className="text-orange-400 hover:text-orange-300">GitHub</a>
                <a href={profileInfo.contact.twitter} target="_blank" rel="noreferrer" className="text-orange-400 hover:text-orange-300">Twitter</a>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {currentView !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`absolute right-4 top-4 bottom-4 w-full max-w-lg rounded-xl backdrop-blur-md p-6 shadow-2xl overflow-y-auto pointer-events-auto
            ${currentView === 'monitor' ? 'bg-slate-950/80 border border-cyan-500/30' : ''}
            ${currentView === 'notebook' ? 'bg-[#f4f1ea]/90 border border-[#d6cfbc] shadow-inner' : ''}
            ${currentView === 'toolbox' ? 'bg-slate-900/90 border border-blue-500/30' : ''}
            ${currentView === 'walkieTalkie' ? 'bg-slate-950/90 border border-orange-500/30' : ''}
          `}
        >
          <button 
            onClick={resetView}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors
              ${currentView === 'notebook' ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-white/10 text-white hover:bg-white/20'}
            `}
          >
            <X size={20} />
          </button>
          
          <div className="mt-8">
            {getOverlayContent()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
