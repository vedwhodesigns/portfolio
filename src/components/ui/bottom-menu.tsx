"use client"

import * as React from "react"
import { motion, AnimatePresence, type Transition } from "framer-motion"
import { cn } from "@/lib/utils"

export interface MenuBarItem {
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface MenuBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onAction'> {
  items: MenuBarItem[];
  onAction?: (index: number) => void;
}

const springConfig: Transition = {
  duration: 0.3,
  ease: "easeInOut"
}

export function MenuBar({ items, className, onAction, ...props }: MenuBarProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const [tooltipPosition, setTooltipPosition] = React.useState({ left: 0, width: 0 })
  const tooltipRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (activeIndex !== null && menuRef.current && tooltipRef.current) {
      const menuItem = menuRef.current.children[activeIndex] as HTMLElement
      const menuRect = menuRef.current.getBoundingClientRect()
      const itemRect = menuItem.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
    
      const left = itemRect.left - menuRect.left + (itemRect.width - tooltipRect.width) / 2
    
      setTooltipPosition({
        left: Math.max(0, Math.min(left, menuRect.width - tooltipRect.width)),
        width: tooltipRect.width
      })
    }
  }, [activeIndex])

  return (
    <div className={cn("relative", className)} {...props}>
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={springConfig}
            className="absolute left-0 right-0 -top-[31px] pointer-events-none z-50"
          >
            <motion.div
              ref={tooltipRef}
              className={cn(
                "h-7 px-3 rounded-lg inline-flex justify-center items-center overflow-hidden",
                "bg-[rgba(43,43,43,0.95)] backdrop-blur text-white",
                "border border-white/10",
                "shadow-[0_0_0_1px_rgba(0,0,0,0.08)]",
              )}
              initial={{ x: tooltipPosition.left }}
              animate={{ x: tooltipPosition.left }}
              transition={springConfig}
              style={{ width: "auto" }}
            >
              <p className="text-[13px] font-medium leading-tight whitespace-nowrap">
                {items[activeIndex].label}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div 
        ref={menuRef}
        className={cn(
          "flex justify-center items-center gap-[2px] z-10",
        )}
      >
        {items.map((item, index) => (
          <button 
            key={index}
            disabled={item.disabled}
            onClick={() => {
              item.onClick?.();
              onAction?.(index);
            }}
            className="w-10 h-10 px-3 py-1 rounded-full flex justify-center items-center gap-2 hover:bg-[#555]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div className="flex justify-center items-center">
              <div className="w-[18px] h-[18px] flex justify-center items-center overflow-hidden text-white">
                <item.icon className="w-full h-full" />
              </div>
            </div>
            <span className="sr-only">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
