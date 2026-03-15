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
    <div className="flex items-center gap-[8px]">
      
      {/* Custom Left Label matching Figma but keeping Liquid OS styling available */}
      <div className="bg-[rgba(43,43,43,0.64)] backdrop-blur shadow-[15px_23px_35px_0px_rgba(0,0,0,0.49)] flex items-center justify-center rounded-[108px] h-[62px] px-[16px]">
        <p className="font-['Inter'] font-normal text-[12px] text-center text-white whitespace-nowrap px-2">
          Page
        </p>
      </div>

      <div className="flex items-center bg-[rgba(43,43,43,0.64)] backdrop-blur shadow-[15px_23px_35px_0px_rgba(0,0,0,0.49)] rounded-[108px] h-[62px] px-[12px] gap-2">
          {/* We will map the MenuBar onto our controls */}
          <MenuBar items={leftItems} onAction={(idx) => leftItems[idx].onClick?.()} />
          
          <div className="bg-[#555] rounded-[200px] h-[38px] flex items-center justify-center px-4">
            <p className="font-['Inter'] font-medium text-[14px] text-center text-white whitespace-nowrap min-w-[60px]">
              {currentPage} of {totalPages}
            </p>
          </div>

          <MenuBar items={rightItems} onAction={(idx) => rightItems[idx].onClick?.()} />

          {/* Divider */}
          <div className="bg-[#d9d9d9] opacity-30 h-[22px] w-px mx-2" />

          <MenuBar items={actionItems} onAction={(idx) => actionItems[idx].onClick?.()} />
      </div>

    </div>
  );
}
