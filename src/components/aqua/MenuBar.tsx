"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';

// ── Helpers ──────────────────────────────────────────────

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Clock ─────────────────────────────────────────────────

function AquaClock() {
  const [now, setNow] = useState(new Date());
  const [analog, setAnalog] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const hDeg = (h % 12) * 30 + m * 0.5;
  const mDeg = m * 6 + s * 0.1;
  const sDeg = s * 6;

  const digital = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <button
      className="menubar-item px-2 font-medium text-[12px]"
      onClick={() => setAnalog((v) => !v)}
      title="Toggle clock"
    >
      {analog ? (
        <svg width="18" height="18" viewBox="0 0 18 18">
          <circle cx="9" cy="9" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* Hour */}
          <line
            x1="9" y1="9"
            x2={9 + 4.5 * Math.sin((hDeg * Math.PI) / 180)}
            y2={9 - 4.5 * Math.cos((hDeg * Math.PI) / 180)}
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          />
          {/* Minute */}
          <line
            x1="9" y1="9"
            x2={9 + 6 * Math.sin((mDeg * Math.PI) / 180)}
            y2={9 - 6 * Math.cos((mDeg * Math.PI) / 180)}
            stroke="currentColor" strokeWidth="1" strokeLinecap="round"
          />
          {/* Second */}
          <line
            x1="9" y1="9"
            x2={9 + 7 * Math.sin((sDeg * Math.PI) / 180)}
            y2={9 - 7 * Math.cos((sDeg * Math.PI) / 180)}
            stroke="#e04040" strokeWidth="0.7" strokeLinecap="round"
          />
          <circle cx="9" cy="9" r="0.8" fill="currentColor" />
        </svg>
      ) : (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{digital}</span>
      )}
    </button>
  );
}

// ── Weather ───────────────────────────────────────────────

const WMO_ICONS: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '❄️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};

function WeatherApplet() {
  const [data, setData] = useState<{ temp: number; icon: string; city: string } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const [weather, geo] = await Promise.all([
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code&forecast_days=1`
          ).then((r) => r.json()),
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
          ).then((r) => r.json()),
        ]);
        const temp = Math.round(weather.current?.temperature_2m ?? 0);
        const code = weather.current?.weather_code ?? 0;
        const icon = WMO_ICONS[code] ?? '🌡️';
        const city =
          geo.address?.city || geo.address?.town || geo.address?.village || 'Local';
        setData({ temp, icon, city });
      } catch { /* ignore */ }
    });
  }, []);

  if (!data) return null;

  return (
    <span className="menubar-item px-2 text-[12px] gap-1 flex items-center select-none">
      <span>{data.icon}</span>
      <span className="font-medium">{data.temp}°C</span>
      <span className="opacity-70">{data.city}</span>
    </span>
  );
}

// ── Volume Slider ──────────────────────────────────────────

function VolumeControl() {
  const { volume, setVolume } = useOSStore();
  const [open, setOpen] = useState(false);

  const icon = volume === 0 ? '🔇' : volume < 0.4 ? '🔉' : '🔊';

  return (
    <div className="relative">
      <button
        className="menubar-item px-2 text-[13px]"
        onClick={() => setOpen((v) => !v)}
        title="Volume"
      >
        {icon}
      </button>
      {open && (
        <div
          className="aqua-dropdown"
          style={{ right: 0, top: '100%', width: 44, paddingTop: 8, paddingBottom: 8 }}
          onMouseLeave={() => setOpen(false)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10 }}>🔊</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="aqua-slider-v"
              style={{ writingMode: 'vertical-lr', direction: 'rtl', height: 80 }}
              title={`${Math.round(volume * 100)}%`}
            />
            <span style={{ fontSize: 10 }}>🔇</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Music Player ───────────────────────────────────────────

function MusicPlayer() {
  const { tracks, currentTrackIndex, isPlaying, volume, currentTime, duration,
    setIsPlaying, nextTrack, prevTrack, setCurrentTime, setDuration } = useOSStore();
  const [open, setOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const track = tracks[currentTrackIndex];
  const [spin, setSpin] = useState(0);

  // Animate record spin
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setSpin((s) => (s + 2) % 360), 50);
    return () => clearInterval(id);
  }, [isPlaying]);

  // Sync audio element
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
  }, [volume]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (track?.url) {
      el.src = track.url;
      if (isPlaying) el.play().catch(() => {});
    }
  }, [currentTrackIndex, track?.url]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) el.play().catch(() => {});
    else el.pause();
  }, [isPlaying]);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative">
      <button
        className="menubar-item px-2 text-[12px] gap-1.5 flex items-center"
        onClick={() => setOpen((v) => !v)}
        title="Music"
      >
        {/* Mini spinning record */}
        <svg
          width="14" height="14" viewBox="0 0 14 14"
          style={{ transform: `rotate(${spin}deg)`, transition: isPlaying ? 'none' : 'transform 0.5s' }}
        >
          <circle cx="7" cy="7" r="7" fill="#222" />
          <circle cx="7" cy="7" r="5" fill="#555" />
          <circle cx="7" cy="7" r="3" fill="#1a1a1a" />
          <circle cx="7" cy="7" r="1.2" fill="#888" />
        </svg>
        <span className="max-w-[80px] truncate hidden sm:block">{track?.title ?? '—'}</span>
      </button>

      {open && (
        <div
          className="aqua-dropdown"
          style={{ right: 0, top: '100%', width: 220, padding: 12 }}
          onMouseLeave={() => setOpen(false)}
        >
          {/* Record art */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <svg
              width="64" height="64" viewBox="0 0 64 64"
              style={{ transform: `rotate(${spin}deg)`, transition: isPlaying ? 'none' : 'transform 0.5s' }}
            >
              <circle cx="32" cy="32" r="31" fill="#1a1a1a" stroke="#555" strokeWidth="1" />
              <circle cx="32" cy="32" r="22" fill="#2a2a2a" />
              <circle cx="32" cy="32" r="14" fill="#111" />
              <circle cx="32" cy="32" r="6" fill="#3a3a3a" />
              <circle cx="32" cy="32" r="2.5" fill="#aaa" />
              {[8, 14, 20].map((r, i) => (
                <circle key={i} cx="32" cy="32" r={r} fill="none" stroke="#444" strokeWidth="0.5" />
              ))}
            </svg>
          </div>

          {/* Track info */}
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: '#1a1a1a' }}>{track?.title ?? '—'}</div>
            <div style={{ fontSize: 11, color: '#666' }}>{track?.artist ?? '—'}</div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 6 }}>
            <div
              style={{ height: 3, background: '#d0d0d0', borderRadius: 2, cursor: 'pointer', position: 'relative' }}
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                const newTime = ratio * duration;
                setCurrentTime(newTime);
                if (audioRef.current) audioRef.current.currentTime = newTime;
              }}
            >
              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#4a8fff,#0055cc)', borderRadius: 2, transition: 'width 0.5s linear' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', marginTop: 2 }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration || (track?.duration ?? 0))}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 16 }}>
            <button className="aqua-control-btn" onClick={prevTrack} title="Previous">⏮</button>
            <button
              className="aqua-control-btn"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶️'}
            </button>
            <button className="aqua-control-btn" onClick={nextTrack} title="Next">⏭</button>
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
        onDurationChange={(e) => setDuration((e.target as HTMLAudioElement).duration)}
        onEnded={nextTrack}
      />
    </div>
  );
}

// ── System Menu ────────────────────────────────────────────

function SystemMenu() {
  const { setPowerState } = useOSStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="menubar-item px-2 text-[15px] font-bold leading-none"
        onClick={() => setOpen((v) => !v)}
        title="Apple Menu"
        style={{ letterSpacing: '-1px' }}
      >

      </button>
      {open && (
        <div className="aqua-dropdown" style={{ left: 0, top: '100%', minWidth: 180 }} onMouseLeave={() => setOpen(false)}>
          <div className="aqua-menu-header">About This Portfolio</div>
          <div className="aqua-menu-divider" />
          <button className="aqua-menu-item" onClick={() => { setOpen(false); }}>System Preferences…</button>
          <div className="aqua-menu-divider" />
          <button className="aqua-menu-item" onClick={() => { setOpen(false); setPowerState('sleep'); }}>Sleep</button>
          <button className="aqua-menu-item" onClick={() => { setOpen(false); setPowerState('active'); }}>Wake</button>
          <div className="aqua-menu-divider" />
          <button className="aqua-menu-item" onClick={() => { setOpen(false); setPowerState('shutdown'); }}>Shut Down…</button>
          <button className="aqua-menu-item" onClick={() => { setOpen(false); setPowerState('active'); window.location.reload(); }}>Restart…</button>
        </div>
      )}
    </div>
  );
}

// ── Finder Menu Items ──────────────────────────────────────

function FinderMenu({ onOpenFinder }: { onOpenFinder: (view: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);

  const menus = [
    { label: 'Finder', items: [
      { label: 'New Finder Window', action: () => onOpenFinder('desktop') },
      { label: 'New Folder', action: null },
    ]},
    { label: 'File', items: [
      { label: 'Open', action: null },
      { label: 'Close Window', action: null },
    ]},
    { label: 'View', items: [
      { label: 'as Icons', action: null },
      { label: 'as List', action: null },
    ]},
    { label: 'Go', items: [
      { label: 'Desktop', action: () => onOpenFinder('desktop') },
      { label: 'Favorites', action: () => onOpenFinder('favorites') },
      { label: 'Applications', action: () => onOpenFinder('applications') },
    ]},
  ];

  return (
    <>
      {menus.map((menu) => (
        <div key={menu.label} className="relative">
          <button
            className={`menubar-item px-2.5 text-[13px] rounded ${open === menu.label ? 'bg-[#0058d0] text-white' : ''}`}
            onClick={() => setOpen(open === menu.label ? null : menu.label)}
            onMouseEnter={() => open && setOpen(menu.label)}
          >
            {menu.label}
          </button>
          {open === menu.label && (
            <div className="aqua-dropdown" style={{ left: 0, top: '100%', minWidth: 200 }} onMouseLeave={() => setOpen(null)}>
              {menu.items.map((item, i) => (
                <button
                  key={i}
                  className="aqua-menu-item"
                  onClick={() => {
                    setOpen(null);
                    item.action?.();
                  }}
                  disabled={!item.action}
                  style={{ opacity: item.action ? 1 : 0.4 }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

// ── MenuBar (main export) ─────────────────────────────────

export default function MenuBar() {
  const { openWindow, windows } = useOSStore();

  const openFinder = useCallback((view: string) => {
    const finderId = `finder-${view}`;
    openWindow({
      id: finderId,
      type: 'finder',
      title: view === 'desktop' ? 'Desktop' : view === 'favorites' ? 'Favorites' : view === 'applications' ? 'Applications' : view,
      x: 80,
      y: 50,
      width: 760,
      height: 500,
      finderView: view,
    });
  }, [openWindow]);

  return (
    <div className="aqua-menubar">
      <div className="flex items-center h-full gap-0.5">
        <SystemMenu />
        <FinderMenu onOpenFinder={openFinder} />
      </div>
      <div className="flex items-center h-full gap-0">
        <WeatherApplet />
        <MusicPlayer />
        <VolumeControl />
        <AquaClock />
      </div>
    </div>
  );
}
