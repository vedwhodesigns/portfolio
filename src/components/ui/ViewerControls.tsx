"use client";

import * as React from "react";
import { MenuBar } from "@/components/ui/bottom-menu";
import { 
  ChevronsLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsRight, 
  Download, 
  Volume2, 
  VolumeX,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Create action callbacks that integrate with the MenuBar
  const leftItems = [
    {
      icon: (props: any) => <ChevronsLeft {...props} />,
      label: "First Page",
      onClick: onFirst,
      disabled: currentPage <= 1
    },
    {
      icon: (props: any) => <ChevronLeft {...props} />,
      label: "Previous",
      onClick: onPrev,
      disabled: currentPage <= 1
    }
  ];

  const rightItems = [
    {
      icon: (props: any) => <ChevronRight {...props} />,
      label: "Next",
      onClick: onNext,
      disabled: currentPage >= totalPages
    },
    {
      icon: (props: any) => <ChevronsRight {...props} />,
      label: "Last Page",
      onClick: onLast,
      disabled: currentPage >= totalPages
    }
  ];

  const actionItems = [
    {
      icon: (props: any) => <Download {...props} />,
      label: "Download",
      onClick: onDownload
    },
    {
      icon: (props: any) => isMuted ? <VolumeX {...props} /> : <Volume2 {...props} />,
      label: isMuted ? "Unmute" : "Mute",
      onClick: onToggleVolume
    }
  ];

  return (
    <div className="bg-[rgba(43,43,43,0.64)] backdrop-blur-xl shadow-[15px_23px_35px_0px_rgba(0,0,0,0.49)] flex items-center px-[8px] py-[8px] rounded-[108px] border border-white/10">
      
      <p className="font-['Inter'] font-normal text-[12px] text-center text-white whitespace-nowrap px-4">
        Page
      </p>

      <div className="bg-[#555]/80 backdrop-blur-md rounded-[200px] flex items-center justify-center px-2 py-1 gap-1 border border-white/5">
        <MenuBar items={leftItems} onAction={(idx) => leftItems[idx].onClick?.()} />
        <p className="font-['Inter'] font-medium text-[14px] text-center text-white whitespace-nowrap px-2">
          {currentPage} of {totalPages}
        </p>
        <MenuBar items={rightItems} onAction={(idx) => rightItems[idx].onClick?.()} />
      </div>

      {/* Divider */}
      <div className="bg-[#d9d9d9] opacity-30 h-[22px] w-px mx-3" />

      <div className="bg-[#515151]/80 backdrop-blur-md rounded-[30px] flex items-center justify-center px-2 py-1 border border-white/5">
        <MenuBar items={actionItems} onAction={(idx) => actionItems[idx].onClick?.()} />
      </div>

    </div>
  );
}
