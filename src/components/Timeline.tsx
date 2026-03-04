import React, { useEffect, useRef } from 'react';
import { create } from 'zustand';
import {
    Play, SkipBack, SkipForward,
    ZoomIn, ZoomOut, Maximize,
    Undo2, Redo2, ChevronDown,
    User, Camera as CameraIcon,
    MessageSquare, Smile, Activity,
    Magnet, Link, Eye, Trash2
} from 'lucide-react';

// ============================================================
// Logic: Types & State Store
// ============================================================

export type TrackType = 'camera' | 'character';
export type SubTrackType = 'action' | 'dialogue' | 'facial' | 'lookAt';

export interface TrackData {
    id: string;
    type: TrackType;
    name: string;
    order: number;
    groupId?: string;
    subType?: SubTrackType;
}

export interface ClipData {
    id: string;
    trackId: string;
    startTime: number; // in seconds
    duration: number; // in seconds
    name: string;
    color?: string;
    type: 'default' | 'image' | 'camera';
    thumbnail?: string;
    targetAvatar?: boolean;
}

interface TimelineState {
    tracks: TrackData[];
    clips: ClipData[];
    pixelsPerSecond: number;
    scrollPosition: number;
    selectedClipIds: string[];
    rippleMode: 'single' | 'group' | 'all';
    quantizeMode: 'off' | '1s' | '5s' | '10s';

    addTrack: (track: Omit<TrackData, 'id'>) => void;
    addClip: (clip: Omit<ClipData, 'id'>) => void;
    setPixelsPerSecond: (value: number) => void;
    setScrollPosition: (value: number) => void;
    undo: () => void;
    redo: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useTimelineStore = create<TimelineState>((set) => ({
    tracks: [],
    clips: [],
    pixelsPerSecond: 60, // Matches the 60px per second ruler design
    scrollPosition: 0,
    selectedClipIds: [],
    rippleMode: 'single',
    quantizeMode: 'off',

    addTrack: (trackData) => set((state) => ({ tracks: [...state.tracks, { ...trackData, id: generateId() }] })),
    addClip: (clipData) => set((state) => ({ clips: [...state.clips, { ...clipData, id: generateId() }] })),
    setPixelsPerSecond: (value) => set({ pixelsPerSecond: Math.max(10, Math.min(200, value)) }),
    setScrollPosition: (value) => set({ scrollPosition: Math.max(0, value) }),
    undo: () => console.log('Undo'),
    redo: () => console.log('Redo'),
}));

// ============================================================
// UI: Icon Helper
// ============================================================
const getTrackIcon = (type: TrackType, subType?: SubTrackType) => {
    if (type === 'camera') return <CameraIcon size={14} />;
    if (type === 'character') {
        if (!subType) return <User size={14} />;
        if (subType === 'action') return <Activity size={12} />;
        if (subType === 'dialogue') return <MessageSquare size={12} />;
        if (subType === 'facial') return <Smile size={12} />;
        if (subType === 'lookAt') return <Eye size={12} />;
    }
    return <div className="w-[14px]" />;
};

// ============================================================
// Main Component
// ============================================================
interface TimelineProps {
    tracks?: any[];
    onAddCharacter?: (name?: string) => void;
    onDeleteCharacter?: (trackId: string) => void;
    playheadPos?: number;
    setPlayheadPos?: (pos: number) => void;
    focusedTrackId?: string | null;
    setFocusedTrackId?: (id: string | null) => void;
    panelMode?: 'default' | 'edit' | 'replace' | 'preview';
    onDeleteClip?: (trackId: string, clipId: string) => void;
    onEditClip?: (trackId: string, clipId: string) => void;
    onReplaceClip?: (trackId: string, clipId: string) => void;
    onAddClip?: (itemName: string, category?: string) => void;
    pendingClip?: { name: string, category: string } | null;
    handleAddDialogueClip?: (characterTrackId: string) => void;
    allDialogueClips?: any[];
    setActiveTab?: (tab: string | null) => void;
    setPanelMode?: (mode: 'default' | 'edit' | 'replace' | 'preview') => void;
    targetClip?: any;
    setTargetClip?: (clip: any) => void;
    onReplaceClipRequest?: (clip: any) => void;
    onClipEditRequest?: (clip: any) => void;
    selectedClip?: any;
    setSelectedClip?: (clip: any) => void;
    closeEditPanel?: () => void;
}

const isPlayheadInClip = (clips: any[], pos: number) => {
    if (!clips) return false;
    return clips.some(clip => pos >= clip.startPos && pos < clip.startPos + clip.length);
};

const Timeline: React.FC<TimelineProps> = ({ tracks: externalTracks, onAddCharacter, onDeleteCharacter, playheadPos = 0, setPlayheadPos, focusedTrackId, setFocusedTrackId, panelMode = 'default', onDeleteClip, onEditClip, onReplaceClip, onAddClip, pendingClip, handleAddDialogueClip, allDialogueClips, setActiveTab, setPanelMode, targetClip, setTargetClip, onReplaceClipRequest, onClipEditRequest, selectedClip, setSelectedClip, closeEditPanel }) => {
    const {
        tracks, clips, pixelsPerSecond,
        addTrack, addClip, setPixelsPerSecond,
        undo, redo
    } = useTimelineStore();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const leftTrackListRef = useRef<HTMLDivElement>(null);
    const timeAreaRef = useRef<HTMLDivElement>(null);
    const [contextMenu, setContextMenu] = React.useState<{ visible: boolean, x: number, y: number, trackId: string, clipId: string } | null>(null);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (leftTrackListRef.current) {
            leftTrackListRef.current.scrollTop = e.currentTarget.scrollTop;
        }
    };

    const handleChangeZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPixelsPerSecond(Number(e.target.value));
    };

    const mainTracks = externalTracks || [];

    // 타임라인 한 칸(Grid) 너비를 상수처럼 정의 (zoom에 따라 동적 변경)
    const GRID_WIDTH = pixelsPerSecond;

    const handleTrackCanvasClick = (e: React.MouseEvent<HTMLDivElement>, trackId: string) => {
        // 배경 클릭 시 컨텍스트 메뉴 닫기
        if (contextMenu) {
            setContextMenu(null);
        }

        const isEditingCamera = (panelMode === 'edit' || panelMode === 'replace') && (targetClip?.category === 'Camera' || targetClip?.trackId === 'camera');

        // 안전장치: 빈 타임라인 공간 클릭 시 에딧/교체 모드 해제 및 선택 해제
        if (!isEditingCamera) {
            if (setPanelMode) setPanelMode('default');
            if (setTargetClip) setTargetClip(null);
            if (setSelectedClip) setSelectedClip(null);
        }

        // 포커스 이동 (캐릭터인 경우 Layout.tsx에서 자동으로 setLastFocusedCharId 동작함)
        if (setFocusedTrackId) setFocusedTrackId(trackId);

        if (!setPlayheadPos || !timeAreaRef.current) return;

        // timeAreaRef를 기준으로 정확한 클릭 X 좌표 계산 (스크롤 위치 포함)
        const rect = timeAreaRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) + timeAreaRef.current.scrollLeft;

        // 클릭을 허용하지 않는 좌측 헤더 영역(약 282px: [250px 텍스트 영역] + [32px 🎬 마커 영역])은 보통 여기 도달하지 않지만 
        // 혹시 모를 오차를 위해 타임라인 시작점을 보정합니다. (현재 Ruler 기준 32px 위치부터가 0초)
        // Canvas 안의 offset 계산이 더 정확하므로 currentTarget.getBoundingClientRect() 사용
        const canvasRect = e.currentTarget.getBoundingClientRect();
        const localX = e.clientX - canvasRect.left;

        const gridIndex = Math.floor(localX / GRID_WIDTH);
        setPlayheadPos(Math.max(0, gridIndex));
    };

    const handleClipClick = (e: React.MouseEvent<HTMLDivElement>, trackId: string, clip: any) => {
        e.stopPropagation(); // 이벤트 버블링 방지로 배경 클릭 막기

        if (setPlayheadPos) {
            setPlayheadPos(clip.startPos);
        }

        // 왼쪽 클릭은 선택만 수행하고 컨텍스트 메뉴는 닫습니다.
        if (setSelectedClip) {
            setSelectedClip({ trackId, ...clip });
        }
        setContextMenu(null);

        // 클릭한 클립과 무관하게, 
        // 현재 일반 클립(Action 등)의 Edit/Replace 창이 열려있을 때만 패널을 닫습니다.
        // Camera 클립의 Edit 창이 열려있는 상태라면 다른 클립을 클릭해도 유지합니다.
        if ((panelMode === 'edit' || panelMode === 'replace') && targetClip?.category !== 'Camera') {
            if (closeEditPanel) {
                closeEditPanel();
            } else {
                if (setPanelMode) setPanelMode('default');
                if (setTargetClip) setTargetClip(null);
            }
        }
    };

    const handleClipContextMenu = (e: React.MouseEvent<HTMLDivElement>, trackId: string, clip: any) => {
        e.preventDefault();
        e.stopPropagation();

        if (setPlayheadPos) {
            setPlayheadPos(clip.startPos);
        }
        if (setSelectedClip) {
            setSelectedClip({ trackId, ...clip });
        }

        const menuWidth = 128; // w-32
        const menuHeight = 112; // approx 3 items
        let x = e.clientX;
        let y = e.clientY;

        if (typeof window !== 'undefined') {
            if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 8;
            if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 8;
        }

        setContextMenu({
            visible: true,
            x,
            y,
            trackId,
            clipId: clip.id
        });
    };

    const handleContextMenuClick = (action: string) => {
        if (!contextMenu) return;

        if (action === 'delete') {
            onDeleteClip && onDeleteClip(contextMenu.trackId, contextMenu.clipId);
        } else if (action === 'edit') {
            onEditClip && onEditClip(contextMenu.trackId, contextMenu.clipId);
        } else if (action === 'replace') {
            onReplaceClip && onReplaceClip(contextMenu.trackId, contextMenu.clipId);
        }

        setContextMenu(null);
    };

    useEffect(() => {
        if (focusedTrackId && timeAreaRef.current) {
            let baseTrackId = focusedTrackId;
            if (focusedTrackId.includes('-') && focusedTrackId.startsWith('char-')) {
                const parts = focusedTrackId.split('-');
                baseTrackId = `${parts[0]}-${parts[1]}`;
            }

            const element = document.getElementById(`track-row-${baseTrackId}`);
            if (element && timeAreaRef.current) {
                const container = timeAreaRef.current;
                const offset = element.offsetTop;
                const containerHeight = container.clientHeight;
                // scroll to roughly center the character track block
                const scrollTop = offset - (containerHeight / 2) + 64;
                container.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
            }
        }
    }, [focusedTrackId]);

    return (
        <div className="relative w-full h-[300px] bg-white border-t border-gray-200 flex flex-col flex-shrink-0 z-30 overflow-hidden text-black">
            {/* Preview Protection Overlay */}
            {panelMode === 'preview' && (
                <div
                    className="absolute inset-0 bg-black/30 z-[100] backdrop-blur-[1.5px] flex items-center justify-center cursor-not-allowed"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-6 py-2 bg-black/40 rounded-full text-white font-semibold tracking-widest drop-shadow-md flex items-center gap-2 animate-pulse">
                        <Eye size={18} /> PREVIEW MODE
                    </div>
                </div>
            )}

            {/* Control Bar */}
            <div className="h-10 border-b border-gray-100 flex items-center justify-between px-3 bg-gray-50/50 select-none flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1 hover:bg-gray-200 px-2 py-1 rounded text-xs font-semibold text-gray-700 transition-colors">
                        <span>🎬 Shot 01</span>
                        <ChevronDown size={12} className="text-gray-400" />
                    </button>
                    <div className="w-[1px] h-3 bg-gray-300" />
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                        <span className="text-[#7C5CFC] font-bold">00:03:f00</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-500">00:31:f09</span>
                    </div>
                    <div className="flex items-center bg-gray-200/60 rounded p-0.5 ml-1 border border-gray-200">
                        <button className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-white text-gray-800 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">T</button>
                        <button className="px-1.5 py-0.5 text-[10px] font-bold rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">F</button>
                    </div>
                </div>

                <div className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center gap-0.5">
                        <button onClick={undo} className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors" title="Undo"><Undo2 size={13} /></button>
                        <button onClick={redo} className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors" title="Redo"><Redo2 size={13} /></button>
                        <div className="w-[1px] h-3 bg-gray-300 mx-1" />
                        <button className="p-1 rounded text-[#7C5CFC] bg-white shadow-sm border border-gray-200/50 transition-colors" title="Snap"><Magnet size={13} /></button>
                        <button className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors" title="Link/Unlink"><Link size={13} /></button>
                    </div>
                    <div className="w-[1px] h-3 bg-gray-300 mx-1" />
                    <div className="flex items-center gap-0.5">
                        <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900 transition-colors"><SkipBack size={13} fill="currentColor" /></button>
                        <button className="p-1.5 hover:bg-[#7C5CFC]/10 rounded text-gray-800 hover:text-[#7C5CFC] transition-colors"><Play size={13} fill="currentColor" /></button>
                        <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900 transition-colors"><SkipForward size={13} fill="currentColor" /></button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                        <ZoomOut size={13} className="text-gray-400" />
                        <input
                            type="range"
                            min="10"
                            max="200"
                            value={pixelsPerSecond}
                            onChange={handleChangeZoom}
                            className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#7C5CFC]"
                        />
                        <ZoomIn size={13} className="text-gray-400" />
                    </div>
                    <div className="w-[1px] h-3 bg-gray-300 mx-1" />
                    <button className="flex items-center gap-1 px-1.5 py-1 hover:bg-gray-200 rounded text-[11px] font-medium text-gray-600 transition-colors">
                        <Maximize size={13} />
                        <span>Fit</span>
                    </button>
                </div>
            </div>

            {/* Unified Timeline Container */}
            <div
                className="flex-1 overflow-auto custom-scrollbar relative bg-gray-50/20"
                ref={timeAreaRef}
                onScroll={handleScroll}
                onContextMenu={(e) => {
                    // Prevent browser default context menu inside timeline area
                    e.preventDefault();
                }}
            >
                {/* 
                  3450px = Left Track List (250px) + Time Area Grid (3200px)
                */}
                <div className="min-w-max w-[3450px] flex flex-col relative bg-white">
                    {/* Background Playhead Vertical Line */}
                    <div
                        className="absolute top-0 bottom-0 w-[1px] bg-red-500 z-40 pointer-events-none"
                        style={{ left: `calc(282px + ${playheadPos * pixelsPerSecond}px)` }}
                    />

                    {/* TOP HEADER ROW: Track Name & Ruler */}
                    <div className="flex flex-row w-full h-8 sticky top-0 z-50 bg-white border-b border-gray-100">
                        {/* Sticky Left: Track Name Header */}
                        <div className="sticky left-0 w-[250px] flex-shrink-0 bg-gray-50 border-r border-gray-100 flex items-center px-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider z-50">
                            Track Name
                        </div>

                        {/* SCROLLING RIGHT: Ruler Area */}
                        <div className="flex-1 relative bg-white overflow-hidden flex" onClick={() => setContextMenu(null)}>
                            {/* Marker Column */}
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute left-0 top-0 bottom-0 w-8 flex-shrink-0 bg-[#7C5CFC]/10 border-solid border-r border-[#7C5CFC]/30 flex flex-col items-center justify-start pt-2 z-20"
                            >
                                <span className="text-[11px] mb-1.5">🎬</span>
                                <span className="text-[#7C5CFC] font-bold text-[11px]" style={{ writingMode: 'vertical-rl' }}>1</span>
                            </div>

                            {/* Playhead Handle */}
                            <div className="absolute bottom-0 z-50 flex flex-col items-center -ml-[5.5px] pointer-events-none" style={{ left: `calc(32px + ${playheadPos * pixelsPerSecond}px)`, marginBottom: '-5px' }}>
                                <div className="w-[11px] h-3 bg-red-500 rounded-sm flex items-center justify-center shadow-sm">
                                    <div className="w-[1px] h-1.5 bg-white/50" />
                                </div>
                                <div className="w-0 h-0 border-l-[5.5px] border-l-transparent border-r-[5.5px] border-r-transparent border-t-[6px] border-t-red-500" />
                            </div>

                            {/* Ruler Labels */}
                            <div className="flex relative z-0 h-full pl-8 pointer-events-none w-[3200px]">
                                {[...Array(60)].map((_, i) => (
                                    <div key={i} className="flex-shrink-0 border-l border-gray-200 h-full relative" style={{ width: `${pixelsPerSecond}px` }}>
                                        <span className="absolute top-1 left-1.5 text-[9px] text-gray-400 font-mono">
                                            {i < 10 ? `0${i}:00` : `${i}:00`}
                                        </span>
                                        <div className="absolute bottom-0 left-[25%] h-1 w-[1px] bg-gray-200" />
                                        <div className="absolute bottom-0 left-[50%] h-1.5 w-[1px] bg-gray-300" />
                                        <div className="absolute bottom-0 left-[75%] h-1 w-[1px] bg-gray-200" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CONTENT TRACK ROWS */}
                    {mainTracks.map((track) => {
                        const isCamera = track.type === 'system';
                        const subs = track.subTracks || [];
                        const isParentFocused = focusedTrackId === track.id || focusedTrackId?.startsWith(`${track.id}-`);

                        return (
                            <React.Fragment key={track.id}>
                                {/* Camera Track */}
                                {isCamera && (
                                    <div
                                        id="track-row-camera"
                                        className={`flex flex-row w-full h-[40px] border-b border-gray-200 box-border cursor-pointer transition-colors ${isParentFocused ? 'bg-purple-50/60' : 'bg-white hover:bg-gray-50'}`}
                                        onClick={(e) => {
                                            setFocusedTrackId && setFocusedTrackId(track.id);
                                        }}
                                    >
                                        {/* Sticky Left: Camera Header */}
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (setFocusedTrackId) setFocusedTrackId(track.id);
                                                if (setPanelMode) setPanelMode('default');
                                                if (setTargetClip) setTargetClip(null);
                                            }}
                                            className={`sticky left-0 h-full w-[250px] flex-shrink-0 border-r border-gray-200 z-40 px-3 flex items-center gap-1.5 text-xs font-bold transition-colors ${isParentFocused ? 'border-l-[3px] border-l-[#7C5CFC] text-[#7C5CFC] bg-purple-50/60' : 'text-gray-800 border-l-[3px] border-l-transparent bg-white hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                <div className="w-[14px]" />
                                                <div className={`flex items-center justify-center -ml-0.5 ${isParentFocused ? "text-[#7C5CFC]" : "text-gray-400"}`}>
                                                    {getTrackIcon('camera')}
                                                </div>
                                                <span className="truncate">{track.name}</span>
                                            </div>
                                        </div>

                                        {/* SCROLLING RIGHT: Camera Timeline Canvas */}
                                        <div
                                            className="flex-1 relative ml-8 h-full"
                                            onClick={(e) => handleTrackCanvasClick(e, track.id)}
                                        >
                                            {!isPlayheadInClip(track.clips, playheadPos) && (
                                                <div
                                                    className="absolute top-0 h-full w-[20px] z-20 group flex items-center pointer-events-auto"
                                                    style={{ left: `${playheadPos * GRID_WIDTH}px`, transform: 'translateX(-50%)' }}
                                                >
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (setFocusedTrackId) setFocusedTrackId(track.id);
                                                            if (setActiveTab) setActiveTab('camera');
                                                            if (setPanelMode) setPanelMode('default');
                                                            if (setTargetClip) setTargetClip(null);
                                                            if (setSelectedClip) setSelectedClip(null);
                                                        }}
                                                        className="flex opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 ml-1 bg-blue-500 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-md cursor-pointer hover:bg-blue-600 whitespace-nowrap items-center pointer-events-auto"
                                                    >
                                                        + Add Clip
                                                    </button>
                                                </div>
                                            )}

                                            {/* Render clips only for Camera track */}
                                            {track.clips?.map((clip: any) => (
                                                <div
                                                    key={clip.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleClipClick(e, track.id, clip);
                                                    }}
                                                    onContextMenu={(e) => {
                                                        handleClipContextMenu(e, track.id, clip);
                                                    }}
                                                    className={`absolute h-[70%] bg-blue-500 rounded text-xs text-white font-medium flex items-center px-2 cursor-pointer border shadow-sm overflow-hidden pointer-events-auto top-1/2 -translate-y-1/2 transition-all duration-200 ${selectedClip?.id === clip.id ? 'ring-2 ring-[#FFD700] ring-offset-1 ring-offset-[#f8fafc] scale-[1.03] brightness-110 shadow-lg z-40 border-transparent' : 'border-blue-600 z-10 hover:brightness-110'}`}
                                                    style={{
                                                        left: `${clip.startPos * GRID_WIDTH}px`,
                                                        width: `${clip.length * GRID_WIDTH}px`,
                                                    }}
                                                >
                                                    <span className="truncate">{clip.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sub Tracks (Character specific layers like Action, Dialogue, etc) */}
                                {subs.map((sub: any, idx: number) => {
                                    const subTrackId = `${track.id}-${sub.name}`;
                                    const isFocused = focusedTrackId === subTrackId || focusedTrackId === track.id;

                                    return (
                                        <div
                                            id={idx === 0 ? `track-row-${track.id}` : undefined}
                                            className={`flex flex-row w-full h-[32px] border-b border-gray-200 box-border cursor-pointer transition-colors ${isFocused ? 'bg-purple-50/50' : 'bg-white hover:bg-gray-50'}`}
                                            key={subTrackId}
                                            onClick={(e) => {
                                                setFocusedTrackId && setFocusedTrackId(subTrackId);
                                            }}
                                        >
                                            {/* Sticky Left: Sub Header */}
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (setFocusedTrackId) setFocusedTrackId(subTrackId);
                                                    if (setPanelMode) setPanelMode('default');
                                                    if (setTargetClip) setTargetClip(null);
                                                }}
                                                className={`sticky left-0 h-full w-[250px] flex-shrink-0 border-r border-gray-200 z-40 pr-2 flex items-center gap-1.5 text-[11px] font-medium transition-colors group/header ${isFocused ? 'border-l-[3px] border-l-[#7C5CFC]/50 text-[#7C5CFC] bg-purple-50/50' : 'text-gray-400 border-l-[3px] border-l-transparent bg-white hover:bg-gray-50'} ${idx === 0 && !isCamera ? 'pl-2' : 'pl-[120px]'}`}
                                            >
                                                {/* Parent Info Merge (Only for index 0 and non-cameras) */}
                                                {idx === 0 && !isCamera && (
                                                    <div className="flex items-center gap-1 mr-auto flex-shrink-0 min-w-0 max-w-[100px]">
                                                        <ChevronDown size={14} className={isParentFocused ? "text-[#7C5CFC]" : "text-gray-400"} />
                                                        <div className={`flex items-center justify-center -ml-0.5 ${isParentFocused ? "text-[#7C5CFC]" : "text-gray-400"}`}>
                                                            {getTrackIcon('character')}
                                                        </div>
                                                        <span className={`truncate text-[11px] font-bold ${isParentFocused ? 'text-[#7C5CFC]' : 'text-gray-800'}`}>{track.name}</span>
                                                    </div>
                                                )}

                                                <div className={`flex items-center gap-1 flex-shrink-0 ${idx > 0 || isCamera ? 'mr-auto' : ''}`}>
                                                    <div className={isFocused ? "text-[#7C5CFC]" : "text-gray-300"}>
                                                        {getTrackIcon('character', sub.name.toLowerCase() as SubTrackType)}
                                                    </div>
                                                    <span className={`truncate transition-colors min-w-10 ${isFocused ? "text-[#7C5CFC]" : "hover:text-gray-600"}`}>
                                                        {sub.name}
                                                    </span>
                                                </div>

                                                {/* Delete Character Button */}
                                                {idx === 0 && !isCamera && onDeleteCharacter && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteCharacter(track.id);
                                                        }}
                                                        className="ml-auto p-[2px] rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/header:opacity-100 transition-all focus:outline-none flex-shrink-0"
                                                        title="Delete Character"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* SCROLLING RIGHT: Timeline Canvas */}
                                            <div
                                                className="flex-1 relative ml-8 h-full"
                                                onClick={(e) => handleTrackCanvasClick(e, subTrackId)}
                                            >
                                                {!isPlayheadInClip(sub.clips, playheadPos) && (
                                                    <div
                                                        className="absolute top-0 h-full w-[20px] z-20 group flex items-center pointer-events-auto"
                                                        style={{ left: `${playheadPos * GRID_WIDTH}px`, transform: 'translateX(-50%)' }}
                                                    >
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (setFocusedTrackId) setFocusedTrackId(subTrackId);
                                                                const trackName = sub.name.toLowerCase();
                                                                switch (trackName) {
                                                                    case 'action':
                                                                        if (setActiveTab) setActiveTab('action');
                                                                        break;
                                                                    case 'facial':
                                                                        if (setActiveTab) setActiveTab('facial');
                                                                        break;
                                                                    case 'look':
                                                                        if (onAddClip) onAddClip('LookAt', 'Look');
                                                                        break;
                                                                    case 'dialogue':
                                                                        if (handleAddDialogueClip) handleAddDialogueClip(track.id);
                                                                        break;
                                                                }
                                                                if (setPanelMode) setPanelMode('default');
                                                                if (setTargetClip) setTargetClip(null);
                                                                if (setSelectedClip) setSelectedClip(null);
                                                            }}
                                                            className="flex opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 ml-1 bg-blue-500 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-md cursor-pointer hover:bg-blue-600 whitespace-nowrap items-center pointer-events-auto"
                                                        >
                                                            + Add Clip
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Render clips for Sub-track */}
                                                {sub.clips?.map((clip: any) => (
                                                <div
                                                    key={clip.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleClipClick(e, subTrackId, clip);
                                                    }}
                                                    onContextMenu={(e) => {
                                                        handleClipContextMenu(e, subTrackId, clip);
                                                    }}
                                                    className={`absolute h-[70%] bg-[#7C5CFC] rounded text-[10px] text-white font-medium flex items-center px-2 cursor-pointer border shadow-sm overflow-hidden top-1/2 -translate-y-1/2 transition-all duration-200 ${selectedClip?.id === clip.id ? 'ring-2 ring-[#FFD700] ring-offset-1 ring-offset-[#f8fafc] scale-[1.03] brightness-125 shadow-lg z-40 border-transparent' : 'border-[#6A4DF0] z-10 hover:brightness-110'}`}
                                                    style={{
                                                        left: `${clip.startPos * GRID_WIDTH}px`,
                                                        width: `${clip.length * GRID_WIDTH}px`,
                                                    }}
                                                >
                                                        <span className="truncate">{clip.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Clip Context Menu */}
            {contextMenu && contextMenu.visible && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 w-32 flex flex-col overflow-hidden"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                >
                    {!contextMenu.trackId.toLowerCase().includes('facial') && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleContextMenuClick('edit'); }}
                            className="px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Edit
                        </button>
                    )}
                    {!(contextMenu.trackId.toLowerCase().includes('dialogue') || contextMenu.trackId.toLowerCase().includes('look')) && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleContextMenuClick('replace'); }}
                            className="px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 font-medium border-b border-gray-100"
                        >
                            Replace
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); handleContextMenuClick('delete'); }}
                        className="px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 font-medium"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default Timeline;
