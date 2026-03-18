"use client";

import React, { useCallback, useEffect } from 'react';
import { useOSStore } from '@/store/useOSStore';
import MenuBar from './MenuBar';
import AquaWindow from './AquaWindow';
import Finder from './Finder';
import MediaViewer from './MediaViewer';

// ── Power overlays ─────────────────────────────────────────

function SleepOverlay({ onWake }: { onWake: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'radial-gradient(ellipse at 50% 50%, #0a0a1a 0%, #000 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
      onClick={onWake}
    >
      <div style={{ textAlign: 'center', color: '#888', userSelect: 'none' }}>
        <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.6 }}>💤</div>
        <div style={{ fontSize: 13 }}>Click to wake</div>
      </div>
    </div>
  );
}

function ShutdownScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
      onClick={onRestart}
    >
      <div style={{ textAlign: 'center', color: '#333', userSelect: 'none' }}>
        <div style={{ fontSize: 13 }}>Click to restart</div>
      </div>
    </div>
  );
}

// ── Desktop icon ───────────────────────────────────────────

function DesktopIcon({ icon, label, onDoubleClick }: { icon: string; label: string; onDoubleClick: () => void }) {
  const [selected, setSelected] = React.useState(false);

  return (
    <button
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '6px 8px', borderRadius: 6, border: 'none', cursor: 'default',
        background: selected ? 'rgba(0,88,208,0.5)' : 'transparent',
        color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)',
        gap: 4, userSelect: 'none', minWidth: 72,
      }}
      onClick={() => setSelected(true)}
      onDoubleClick={onDoubleClick}
      onBlur={() => setSelected(false)}
    >
      <span style={{ fontSize: 44, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 500, textAlign: 'center', maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </button>
  );
}

// ── Minimized window "genie" dock entries ──────────────────

function MinimizedDock() {
  const { windows, restoreWindow } = useOSStore();
  const minimized = windows.filter((w) => w.isMinimized);
  if (minimized.length === 0) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 8, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 8, background: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(12px)', borderRadius: 12, padding: '6px 12px',
      border: '1px solid rgba(255,255,255,0.25)', zIndex: 8000,
    }}>
      {minimized.map((w) => (
        <button
          key={w.id}
          onClick={() => restoreWindow(w.id)}
          title={`Restore: ${w.title}`}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8, padding: '4px 8px', cursor: 'pointer', color: '#fff',
          }}
        >
          <span style={{ fontSize: 20 }}>{w.type === 'finder' ? '📁' : '🖼️'}</span>
          <span style={{ fontSize: 9, maxWidth: 56, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.title}</span>
        </button>
      ))}
    </div>
  );
}

// ── AquaDesktop ────────────────────────────────────────────

export default function AquaDesktop() {
  const { powerState, setPowerState, windows, openWindow, activeFile, files } = useOSStore();

  // Open Finder on first load
  useEffect(() => {
    openWindow({
      id: 'finder-desktop',
      type: 'finder',
      title: 'Desktop',
      x: 80,
      y: 50,
      width: 760,
      height: 500,
      finderView: 'desktop',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDesktopClick = useCallback(() => {
    useOSStore.setState({ activeWindowId: null });
  }, []);

  return (
    <div
      className="aqua-wallpaper"
      style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}
      onClick={handleDesktopClick}
    >
      {/* Menu Bar */}
      <MenuBar />

      {/* Desktop Icons (top-right corner) */}
      <div style={{
        position: 'absolute', top: 32, right: 16,
        display: 'flex', flexDirection: 'column', gap: 8, zIndex: 100,
      }}>
        <DesktopIcon
          icon="📁"
          label="Portfolio"
          onDoubleClick={() => openWindow({
            id: 'finder-desktop',
            type: 'finder',
            title: 'Desktop',
            x: 80, y: 50, width: 760, height: 500,
            finderView: 'desktop',
          })}
        />
        <DesktopIcon
          icon="⭐"
          label="Favorites"
          onDoubleClick={() => openWindow({
            id: 'finder-favorites',
            type: 'finder',
            title: 'Favorites',
            x: 100, y: 60, width: 700, height: 480,
            finderView: 'favorites',
          })}
        />
        <DesktopIcon
          icon="📦"
          label="Applications"
          onDoubleClick={() => openWindow({
            id: 'finder-applications',
            type: 'finder',
            title: 'Applications',
            x: 120, y: 70, width: 680, height: 460,
            finderView: 'applications',
          })}
        />
      </div>

      {/* Windows */}
      {windows.map((win) => (
        <AquaWindow key={win.id} win={win}>
          {win.type === 'finder' && (
            <Finder windowId={win.id} initialView={win.finderView ?? 'desktop'} />
          )}
          {win.type === 'media' && activeFile && (
            <MediaViewer file={activeFile} />
          )}
        </AquaWindow>
      ))}

      {/* Minimized Dock */}
      <MinimizedDock />

      {/* Power Overlays */}
      {powerState === 'sleep' && (
        <SleepOverlay onWake={() => setPowerState('active')} />
      )}
      {powerState === 'shutdown' && (
        <ShutdownScreen onRestart={() => setPowerState('active')} />
      )}
    </div>
  );
}
