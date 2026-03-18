"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useOSStore, FileData } from '@/store/useOSStore';

function getFileExtension(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

function VideoPlayer({ file }: { file: FileData }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) v.pause(); else v.play();
    setPlaying(!playing);
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#000' }}>
      <video
        ref={videoRef}
        src={file.fileUrl}
        muted={muted}
        autoPlay
        style={{ flex: 1, width: '100%', objectFit: 'contain' }}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
        onDurationChange={() => setDuration(videoRef.current?.duration ?? 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onClick={toggle}
      />
      {/* Controls */}
      <div style={{ background: '#1a1a1a', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={toggle} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
          {playing ? '⏸' : '▶️'}
        </button>
        <div
          onClick={seekTo}
          style={{ flex: 1, height: 4, background: '#444', borderRadius: 2, cursor: 'pointer', position: 'relative' }}
        >
          <div style={{ height: '100%', width: `${pct}%`, background: '#4a8fff', borderRadius: 2 }} />
        </div>
        <span style={{ color: '#aaa', fontSize: 11, whiteSpace: 'nowrap' }}>{fmt(currentTime)} / {fmt(duration)}</span>
        <button
          onClick={() => { setMuted(m => !m); if (videoRef.current) videoRef.current.muted = !muted; }}
          style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  );
}

function ImageViewer({ file }: { file: FileData }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#2a2a2a' }}>
      <img
        src={file.fileUrl}
        alt={file.name}
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
        draggable={false}
      />
    </div>
  );
}

function PDFViewer({ file }: { file: FileData }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <iframe
        src={file.fileUrl}
        title={file.name}
        style={{ flex: 1, border: 'none', width: '100%' }}
      />
    </div>
  );
}

// ── Media Viewer content ───────────────────────────────────

export default function MediaViewer({ file }: { file: FileData }) {
  const ext = getFileExtension(file.name);

  const videoExts = ['mp4', 'mov', 'webm', 'avi', 'm4v'];
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

  if (videoExts.includes(ext)) {
    return <VideoPlayer file={file} />;
  }
  if (imageExts.includes(ext)) {
    return <ImageViewer file={file} />;
  }
  if (ext === 'pdf') {
    return <PDFViewer file={file} />;
  }

  // Fallback
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#666' }}>
      <span style={{ fontSize: 64 }}>📄</span>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{file.name}</span>
      <a
        href={file.fileUrl}
        download={file.name}
        style={{ padding: '6px 16px', background: '#0058d0', color: '#fff', borderRadius: 6, fontSize: 13, textDecoration: 'none' }}
      >
        Download
      </a>
    </div>
  );
}
