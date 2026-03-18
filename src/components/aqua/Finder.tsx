"use client";

import React, { useMemo, useState } from 'react';
import { useOSStore, FileData } from '@/store/useOSStore';
import { APP_TAGS } from '@/data/masterFiles';

type ViewMode = 'icon' | 'list';
type SortCol = 'name' | 'date' | 'kind';
type SortDir = 'asc' | 'desc';

// ── File Icon ──────────────────────────────────────────────

function FileIcon({ file, size = 48 }: { file: FileData; size?: number }) {
  if (file.thumbnailUrl) {
    return (
      <img
        src={file.thumbnailUrl}
        alt={file.name}
        style={{ width: size, height: size, objectFit: 'cover', borderRadius: 4, display: 'block' }}
        draggable={false}
      />
    );
  }
  const icons: Record<string, string> = { Video: '🎬', Image: '🖼️', PDF: '📄', Application: '📦', Folder: '📁' };
  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.65 }}>
      {icons[file.kind] ?? '📄'}
    </div>
  );
}

// ── App Icon (for Applications view) ──────────────────────

function AppIcon({ tag, label, color, abbr, onClick }: {
  tag: string; label: string; color: string; abbr: string; onClick: () => void;
}) {
  return (
    <button
      className="finder-icon-item"
      onDoubleClick={onClick}
      title={`Open ${label}`}
    >
      <div style={{
        width: 52, height: 52,
        borderRadius: 12,
        background: `linear-gradient(145deg, ${color}cc, ${color})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 3px 8px ${color}66, inset 0 1px 0 rgba(255,255,255,0.4)`,
        color: '#fff',
        fontWeight: 700,
        fontSize: abbr.length > 3 ? 9 : 11,
        fontFamily: 'system-ui',
        letterSpacing: '-0.5px',
        userSelect: 'none',
      }}>
        {abbr}
      </div>
      <span style={{ fontSize: 11, marginTop: 4, textAlign: 'center', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </button>
  );
}

// ── Sidebar ────────────────────────────────────────────────

function FinderSidebar({ currentView, onSelect }: { currentView: string; onSelect: (v: string) => void }) {
  const sections = [
    {
      header: 'PLACES',
      items: [
        { id: 'desktop', label: 'Desktop', icon: '🖥️' },
        { id: 'favorites', label: 'Favorites', icon: '⭐' },
        { id: 'applications', label: 'Applications', icon: '📦' },
      ],
    },
    {
      header: 'SEARCH FOR',
      items: [
        { id: 'filter-Video', label: 'Video', icon: '🎬' },
        { id: 'filter-Image', label: 'Images', icon: '🖼️' },
        { id: 'filter-PDF', label: 'Documents', icon: '📄' },
      ],
    },
  ];

  return (
    <div className="aqua-finder-sidebar">
      {sections.map((sec) => (
        <div key={sec.header}>
          <div className="finder-sidebar-header">{sec.header}</div>
          {sec.items.map((item) => (
            <button
              key={item.id}
              className={`finder-sidebar-item ${currentView === item.id ? 'finder-sidebar-item-active' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              <span style={{ marginRight: 6 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Main Finder Component ──────────────────────────────────

interface FinderProps {
  windowId: string;
  initialView?: string;
}

export default function Finder({ windowId, initialView = 'desktop' }: FinderProps) {
  const { files, openFile, openWindow } = useOSStore();
  const [currentView, setCurrentView] = useState(initialView);
  const [viewMode, setViewMode] = useState<ViewMode>('icon');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<SortCol>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Compute which files to show
  const displayedFiles = useMemo(() => {
    let result: FileData[] = [];

    if (currentView === 'desktop') {
      result = [...files];
    } else if (currentView === 'favorites') {
      result = files.filter((f) => f.tags.some((t) => t.toLowerCase() === 'favorite'));
    } else if (currentView === 'applications') {
      return null; // handled separately
    } else if (currentView.startsWith('filter-')) {
      const kind = currentView.replace('filter-', '');
      result = files.filter((f) => f.kind === kind);
    } else {
      // tag-based filter (from app folder)
      result = files.filter((f) =>
        f.tags.some((t) => t.toLowerCase() === currentView.toLowerCase())
      );
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortCol === 'date') cmp = a.dateModified.localeCompare(b.dateModified);
      else if (sortCol === 'kind') cmp = a.kind.localeCompare(b.kind);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [files, currentView, sortCol, sortDir]);

  // Available app icons (only those that have at least one file)
  const availableApps = useMemo(() => {
    return APP_TAGS.filter((app) =>
      files.some((f) => f.tags.some((t) => t.toLowerCase() === app.tag.toLowerCase()))
    );
  }, [files]);

  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('asc'); }
  };

  const handleOpenApp = (tag: string, label: string) => {
    openWindow({
      id: `finder-${tag}`,
      type: 'finder',
      title: label,
      x: 140,
      y: 80,
      width: 700,
      height: 480,
      finderView: tag,
    });
  };

  const handleFileDoubleClick = (file: FileData) => {
    openFile(file);
    setSelectedId(file.id);
  };

  const sortArrow = (col: SortCol) => sortCol === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <div style={{ display: 'flex', height: '100%', background: '#f0f0f0' }}>
      {/* Sidebar */}
      <FinderSidebar currentView={currentView} onSelect={setCurrentView} />

      {/* Main panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div className="aqua-finder-toolbar">
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="finder-tool-btn" onClick={() => setViewMode('icon')} style={{ background: viewMode === 'icon' ? 'rgba(0,0,0,0.12)' : 'transparent' }} title="Icon View">▦</button>
            <button className="finder-tool-btn" onClick={() => setViewMode('list')} style={{ background: viewMode === 'list' ? 'rgba(0,0,0,0.12)' : 'transparent' }} title="List View">☰</button>
          </div>
          <span style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>
            {currentView === 'desktop' ? 'Desktop' : currentView === 'favorites' ? 'Favorites' : currentView === 'applications' ? 'Applications' : currentView}
          </span>
          <span style={{ fontSize: 11, color: '#888' }}>
            {displayedFiles ? `${displayedFiles.length} item${displayedFiles.length !== 1 ? 's' : ''}` : `${availableApps.length} apps`}
          </span>
        </div>

        {/* Content area */}
        <div className="aqua-finder-content" onClick={() => setSelectedId(null)}>

          {/* Applications view */}
          {currentView === 'applications' && (
            <div className="finder-icon-grid" style={{ padding: 16 }}>
              {availableApps.map((app) => (
                <AppIcon
                  key={app.tag}
                  {...app}
                  onClick={() => handleOpenApp(app.tag, app.label)}
                />
              ))}
            </div>
          )}

          {/* Icon View */}
          {displayedFiles && viewMode === 'icon' && (
            <div className="finder-icon-grid" style={{ padding: 16 }}>
              {displayedFiles.map((file) => (
                <button
                  key={file.id}
                  className={`finder-icon-item ${selectedId === file.id ? 'finder-icon-selected' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedId(file.id); }}
                  onDoubleClick={(e) => { e.stopPropagation(); handleFileDoubleClick(file); }}
                >
                  <FileIcon file={file} size={52} />
                  <span style={{
                    fontSize: 11,
                    marginTop: 4,
                    textAlign: 'center',
                    maxWidth: 72,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.3,
                    padding: selectedId === file.id ? '1px 4px' : '1px 4px',
                    borderRadius: 3,
                    background: selectedId === file.id ? '#0058d0' : 'transparent',
                    color: selectedId === file.id ? '#fff' : 'inherit',
                  }}>
                    {file.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* List View */}
          {displayedFiles && viewMode === 'list' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr className="finder-list-header">
                  <th onClick={() => handleSort('name')} style={{ textAlign: 'left', padding: '4px 8px', cursor: 'pointer', userSelect: 'none', width: '45%' }}>Name{sortArrow('name')}</th>
                  <th onClick={() => handleSort('date')} style={{ textAlign: 'left', padding: '4px 8px', cursor: 'pointer', userSelect: 'none', width: '20%' }}>Date Modified{sortArrow('date')}</th>
                  <th onClick={() => handleSort('kind')} style={{ textAlign: 'left', padding: '4px 8px', cursor: 'pointer', userSelect: 'none', width: '15%' }}>Kind{sortArrow('kind')}</th>
                  <th style={{ textAlign: 'right', padding: '4px 8px', width: '10%' }}>Size</th>
                </tr>
              </thead>
              <tbody>
                {displayedFiles.map((file) => (
                  <tr
                    key={file.id}
                    className={`finder-list-row ${selectedId === file.id ? 'finder-list-row-selected' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(file.id); }}
                    onDoubleClick={(e) => { e.stopPropagation(); handleFileDoubleClick(file); }}
                  >
                    <td style={{ padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileIcon file={file} size={16} />
                      {file.name}
                    </td>
                    <td style={{ padding: '3px 8px', color: '#666' }}>{file.dateModified}</td>
                    <td style={{ padding: '3px 8px', color: '#666' }}>{file.kind}</td>
                    <td style={{ padding: '3px 8px', textAlign: 'right', color: '#666' }}>{file.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Status bar */}
        <div className="aqua-finder-statusbar">
          {selectedId && displayedFiles?.find(f => f.id === selectedId) ? (
            <span>{displayedFiles.find(f => f.id === selectedId)?.name} — {displayedFiles.find(f => f.id === selectedId)?.size} — Double-click to open</span>
          ) : (
            <span>{displayedFiles ? `${displayedFiles.length} items` : `${availableApps.length} applications`}</span>
          )}
        </div>
      </div>
    </div>
  );
}
