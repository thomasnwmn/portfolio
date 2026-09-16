'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const BootSequence = ({ children }: { children: React.ReactNode }) => {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    // Simulate boot time
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isBooting && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center font-mono text-cyan-500"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold tracking-widest mb-4 uppercase">Initializing System</h1>
              <div className="w-64 h-1 bg-slate-800 rounded overflow-hidden">
                <motion.div 
                  className="h-full bg-cyan-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "linear" }}
                />
              </div>
              <p className="mt-4 text-xs text-cyan-700 animate-pulse">Loading Environment Variables...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
};
