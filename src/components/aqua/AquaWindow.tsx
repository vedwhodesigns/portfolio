"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useOSStore, OSWindow } from '@/store/useOSStore';

interface AquaWindowProps {
  win: OSWindow;
  children: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
}

export default function AquaWindow({
  win,
  children,
  minWidth = 280,
  minHeight = 180,
}: AquaWindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPos, updateWindowSize, activeWindowId } = useOSStore();

  const [pos, setPos] = useState({ x: win.x, y: win.y });
  const [size, setSize] = useState({ width: win.width, height: win.height });
  const isActive = activeWindowId === win.id;

  // Sync if store updates externally (e.g. maximize)
  useEffect(() => { setPos({ x: win.x, y: win.y }); }, [win.x, win.y]);
  useEffect(() => { setSize({ width: win.width, height: win.height }); }, [win.width, win.height]);

  // ── Drag ──────────────────────────────────────────────
  const dragRef = useRef<{ startMouseX: number; startMouseY: number; startWinX: number; startWinY: number } | null>(null);

  const onTitleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.traffic-light')) return;
    e.preventDefault();
    focusWindow(win.id);
    dragRef.current = { startMouseX: e.clientX, startMouseY: e.clientY, startWinX: pos.x, startWinY: pos.y };

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const nx = dragRef.current.startWinX + ev.clientX - dragRef.current.startMouseX;
      const ny = Math.max(22, dragRef.current.startWinY + ev.clientY - dragRef.current.startMouseY);
      setPos({ x: nx, y: ny });
    };
    const onUp = () => {
      if (!dragRef.current) return;
      const nx = dragRef.current.startWinX + (window.event as MouseEvent)?.clientX - dragRef.current.startMouseX || pos.x;
      updateWindowPos(win.id, pos.x, pos.y);
      dragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [win.id, pos, focusWindow, updateWindowPos]);

  // ── Resize ────────────────────────────────────────────
  const resizeRef = useRef<{ startMouseX: number; startMouseY: number; startW: number; startH: number } | null>(null);

  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    focusWindow(win.id);
    resizeRef.current = { startMouseX: e.clientX, startMouseY: e.clientY, startW: size.width, startH: size.height };

    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const nw = Math.max(minWidth, resizeRef.current.startW + ev.clientX - resizeRef.current.startMouseX);
      const nh = Math.max(minHeight, resizeRef.current.startH + ev.clientY - resizeRef.current.startMouseY);
      setSize({ width: nw, height: nh });
    };
    const onUp = () => {
      if (!resizeRef.current) return;
      updateWindowSize(win.id, size.width, size.height);
      resizeRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [win.id, size, focusWindow, updateWindowSize, minWidth, minHeight]);

  if (win.isMinimized) return null;

  const isMaximized = win.isMaximized;

  return (
    <div
      className="aqua-window"
      style={{
        position: 'fixed',
        left: isMaximized ? 0 : pos.x,
        top: isMaximized ? 22 : pos.y,
        width: isMaximized ? '100vw' : size.width,
        height: isMaximized ? 'calc(100vh - 22px)' : size.height,
        zIndex: win.zIndex,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: isMaximized ? 0 : 8,
        overflow: 'hidden',
        boxShadow: isActive
          ? '0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.25)'
          : '0 10px 30px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.2)',
      }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title Bar */}
      <div
        className={`aqua-titlebar ${isActive ? 'aqua-titlebar-active' : 'aqua-titlebar-inactive'}`}
        onMouseDown={onTitleMouseDown}
        onDoubleClick={() => maximizeWindow(win.id)}
        style={{ cursor: 'default', userSelect: 'none' }}
      >
        {/* Traffic Lights */}
        <div className="traffic-lights traffic-light">
          <button
            className="tl tl-red"
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
            title="Close"
          >
            <span className="tl-icon">×</span>
          </button>
          <button
            className="tl tl-yellow"
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
            title="Minimize"
          >
            <span className="tl-icon">−</span>
          </button>
          <button
            className="tl tl-green"
            onClick={(e) => { e.stopPropagation(); maximizeWindow(win.id); }}
            title="Maximize"
          >
            <span className="tl-icon">+</span>
          </button>
        </div>

        {/* Title */}
        <span className="aqua-window-title">{win.title}</span>
      </div>

      {/* Content */}
      <div className="aqua-window-content" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>

      {/* Resize Handle */}
      {!isMaximized && (
        <div
          className="aqua-resize-handle"
          onMouseDown={onResizeMouseDown}
        />
      )}
    </div>
  );
}
