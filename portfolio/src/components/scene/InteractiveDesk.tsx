'use client';
import React from 'react';
import Image from 'next/image';
import { useStore } from '../../hooks/useStore';
import { motion } from 'framer-motion';

export const InteractiveDesk = () => {
  const setView = useStore((state) => state.setView);

  // Animation variants for hover effects
  const propVariants = {
    initial: { scale: 1, filter: 'brightness(1)' },
    hover: { scale: 1.05, filter: 'brightness(1.2)' },
    tap: { scale: 0.95 }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 flex items-center justify-center">
      
      {/* Base Desk Texture */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "url('/images/desk.jpg')",
          backgroundSize: '400px',
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Isometric Container - using CSS transform to create orthographic/isometric perspective */}
      <div 
        className="relative w-[1200px] h-[800px]"
        style={{
          transform: "scale(0.8)", // Adjust base scale as needed
        }}
      >
        {/* Monitor (Center/Top) */}
        <motion.div
          variants={propVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          onClick={() => setView('monitor')}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 cursor-pointer z-10 w-[300px] h-[300px]"
        >
          <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
             <Image src="/images/monitor.jpg" alt="Monitor" fill className="object-cover" />
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded text-sm border border-cyan-500/50 backdrop-blur font-mono whitespace-nowrap">
            Projects & Architecture
          </div>
        </motion.div>

        {/* Notebook (Right) */}
        <motion.div
          variants={propVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          onClick={() => setView('notebook')}
          className="absolute top-1/2 right-[15%] cursor-pointer z-20 w-[200px] h-[200px]"
        >
          <div className="relative w-full h-full rounded-xl overflow-hidden border-4 border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
             <Image src="/images/notebook.jpg" alt="Notebook" fill className="object-cover" />
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-violet-500/20 text-violet-300 px-3 py-1 rounded text-sm border border-violet-500/50 backdrop-blur font-mono whitespace-nowrap">
            Work History
          </div>
        </motion.div>

        {/* Toolbox (Left) */}
        <motion.div
          variants={propVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          onClick={() => setView('toolbox')}
          className="absolute bottom-1/4 left-[15%] cursor-pointer z-20 w-[250px] h-[250px]"
        >
          <div className="relative w-full h-full rounded-xl overflow-hidden border-4 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
             <Image src="/images/toolbox.jpg" alt="Toolbox" fill className="object-cover" />
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded text-sm border border-blue-500/50 backdrop-blur font-mono whitespace-nowrap">
            Technical Stack
          </div>
        </motion.div>

        {/* Walkie-Talkie (Bottom Right) */}
        <motion.div
          variants={propVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          onClick={() => setView('walkieTalkie')}
          className="absolute bottom-[10%] right-[30%] cursor-pointer z-30 w-[150px] h-[150px]"
        >
          <div className="relative w-full h-full rounded-xl overflow-hidden border-4 border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
             <Image src="/images/walkietalkie.jpg" alt="Walkie Talkie" fill className="object-cover" />
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-orange-500/20 text-orange-300 px-3 py-1 rounded text-sm border border-orange-500/50 backdrop-blur font-mono whitespace-nowrap">
            Contact
          </div>
        </motion.div>
      </div>
    </div>
  );
};
