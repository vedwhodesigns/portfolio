"use client";

import { useState } from "react";
import ViewerControls from "@/components/ui/ViewerControls";
import { motion } from "framer-motion";

export default function Home() {
  const [page, setPage] = useState(1);
  const [muted, setMuted] = useState(false);
  const totalPages = 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-transparent relative overflow-hidden">
      
      {/* Organic Moving Code Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-[10px] font-mono whitespace-nowrap text-foreground opacity-30 dark:opacity-20"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000) - 200, 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000) - 200,
            }}
            animate={{ 
              x: Math.random() * 1200 - 100, 
              y: Math.random() * 1000 - 100,
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: Math.random() * 20 + 20, 
              repeat: Infinity, 
              repeatType: "mirror",
              ease: "linear"
            }}
          >
            {`const liquidVolume_${i} = physical.transmission * ior.dispersion;`}
          </motion.div>
        ))}
      </div>

      <main className="flex flex-col items-center max-w-2xl w-full z-10">
        <h1 className="text-4xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Portfolio 2026</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-20 text-center">
          Test out the exact Figma Node 30:231 interactions!<br/>
          (Move your cursor or scroll to see the liquid glass in action)
        </p>
        
        {/* Demonstrate the Viewer Controls */}
        <div className="fixed bottom-6 right-6 z-40">
          <ViewerControls 
            currentPage={page}
            totalPages={totalPages}
            onFirst={() => setPage(1)}
            onPrev={() => setPage(Math.max(1, page - 1))}
            onNext={() => setPage(Math.min(totalPages, page + 1))}
            onLast={() => setPage(totalPages)}
            onToggleVolume={() => setMuted(!muted)}
            isMuted={muted}
            onDownload={() => alert("Downloading portfolio...")}
          />
        </div>
      </main>
    </div>
  );
}
