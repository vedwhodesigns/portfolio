"use client";

import * as React from "react";
import { 
  ChevronsLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsRight, 
  Download, 
  Volume2, 
  VolumeX 
} from "lucide-react";

interface ViewerControlsProps {
  currentPage?: number;
  totalPages?: number;
  onFirst?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onLast?: () => void;
  onDownload?: () => void;
  onToggleVolume?: () => void;
  isMuted?: boolean;
}

export default function ViewerControls({
  currentPage = 1,
  totalPages = 100,
  onFirst,
  onPrev,
  onNext,
  onLast,
  onDownload,
  onToggleVolume,
  isMuted = false,
}: ViewerControlsProps) {
  return (
    <div 
      className="bg-[rgba(43,43,43,0.64)] flex items-center gap-[8px] px-[16px] py-[12px] relative rounded-[108px] shadow-[15px_23px_35px_0px_rgba(0,0,0,0.49)] h-[62px]"
    >
      <p className="font-['Inter'] font-normal text-[12px] text-center text-white whitespace-nowrap px-2">
        Page
      </p>

      {/* Pagination Controls */}
      <div className="bg-[#555] flex gap-[12px] items-center justify-center px-[16px] py-[8px] relative rounded-[200px] h-[38px]">
        <button 
          onClick={onFirst}
          disabled={currentPage <= 1}
          className="text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={onPrev}
          disabled={currentPage <= 1}
          className="text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <p className="font-['Inter'] font-medium text-[14px] text-center text-white whitespace-nowrap min-w-[60px]">
          {currentPage} of {totalPages}
        </p>
        
        <button 
          onClick={onNext}
          disabled={currentPage >= totalPages}
          className="text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button 
          onClick={onLast}
          disabled={currentPage >= totalPages}
          className="text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="bg-[#d9d9d9] opacity-30 h-[22px] w-px" />

      {/* Action Controls */}
      <div className="bg-[#515151] flex gap-[16px] items-center px-[20px] py-[8px] relative rounded-[30px] h-[38px]">
        <button 
          onClick={onDownload}
          className="text-white hover:text-gray-300 transition-colors"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
        
        {/* Divider Inner */}
        <div className="bg-[#d9d9d9] opacity-30 h-[16px] w-px" />
        
        <button 
          onClick={onToggleVolume}
          className="text-white hover:text-gray-300 transition-colors"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
