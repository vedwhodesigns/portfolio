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
      
      <main className="flex flex-col items-center max-w-2xl w-full z-10 pt-[20vh] drop-shadow-2xl">
        <h1 className="text-4xl font-bold mb-4 text-white dark:text-zinc-100">Portfolio 2026</h1>
        <p className="text-white/80 dark:text-zinc-400 mb-20 text-center font-medium">
          Apple Glass Explicit Properties Applied<br/>
          (Hover the Nav Bar to see Refraction, Depth, Frost)
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
