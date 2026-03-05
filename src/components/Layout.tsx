"use client";

import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Search,
  X
} from 'lucide-react';
import ActionPanel from './ActionPanel';
import CameraPanel from './CameraPanel';
import CharacterPanel from './CharacterPanel';
import DefaultPanel from './DefaultPanel';
import FacialPanel from './FacialPanel';
import DialoguePanel from './DialoguePanel';
import EditPanel from './EditPanel';
import Sidebar, { MENU_ITEMS } from './Sidebar';
import Timeline from './Timeline';

interface LayoutProps {
  children?: ReactNode;
}



const Layout: React.FC<LayoutProps> = ({ children }) => {
  const MIN_TIMELINE_HEIGHT = 180;
  const MAX_TIMELINE_HEIGHT = 600;
  const TIMELINE_HEIGHT_STORAGE_KEY = 'cinev.timelineHeight';
  const [activeTab, _setActiveTab] = useState<string | null>('default');
  const [previousTab, setPreviousTab] = useState<string | null>('default');

  const setActiveTab = (tab: string | null) => {
    setPreviousTab(activeTab);
    _setActiveTab(tab);
  };

  const closeEditPanel = () => {
    setPanelMode('default');
    setTargetClip(null);
    setActiveTab(previousTab);
  };

  // Playback & Editing State
  const [playheadPos, setPlayheadPos] = useState(0);
  const [panelMode, setPanelMode] = useState<'default' | 'edit' | 'replace' | 'preview'>('default');
  const [targetClip, setTargetClip] = useState<any | null>(null);
  const [pendingClip, setPendingClip] = useState<{ name: string, category: string } | null>(null);
  const [selectedClip, setSelectedClip] = useState<any | null>(null);
  const [focusedTrackId, setFocusedTrackId] = useState<string | null>('camera');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFocusedCharId, setLastFocusedCharId] = useState<string | null>(null);
  const [timelineHeight, setTimelineHeight] = useState(300);
  const timelineHeightLoadedRef = useRef(false);
  const isTimelineResizingRef = useRef(false);
  const timelineResizeStartYRef = useRef(0);
  const timelineResizeStartHeightRef = useRef(300);

  const clampTimelineHeight = (height: number) => {
    return Math.max(MIN_TIMELINE_HEIGHT, Math.min(MAX_TIMELINE_HEIGHT, height));
  };

  const handleTimelineResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isTimelineResizingRef.current = true;
    timelineResizeStartYRef.current = e.clientY;
    timelineResizeStartHeightRef.current = timelineHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isTimelineResizingRef.current) return;

      const deltaY = timelineResizeStartYRef.current - e.clientY;
      const nextHeight = timelineResizeStartHeightRef.current + deltaY;
      setTimelineHeight(clampTimelineHeight(nextHeight));
    };

    const handleMouseUp = () => {
      if (!isTimelineResizingRef.current) return;
      isTimelineResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(TIMELINE_HEIGHT_STORAGE_KEY);
      if (saved) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed)) {
          setTimelineHeight(clampTimelineHeight(parsed));
        }
      }
    } catch {
      // Ignore localStorage access failures
    } finally {
      timelineHeightLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!timelineHeightLoadedRef.current) return;
    try {
      window.localStorage.setItem(TIMELINE_HEIGHT_STORAGE_KEY, String(timelineHeight));
    } catch {
      // Ignore localStorage access failures
    }
  }, [timelineHeight]);

  const handleSetFocusedTrackId = (id: string | null) => {
    setFocusedTrackId(id);
    if (id && id !== 'camera' && id.startsWith('char-')) {
      const parts = id.split('-');
      if (parts.length >= 2) {
        setLastFocusedCharId(`${parts[0]}-${parts[1]}`);
      }
    }
  };

  const [tracks, setTracks] = useState<any[]>([
    { id: 'camera', name: 'Camera', type: 'system', clips: [] }
  ]);

  const handleAddCharacter = (name?: string) => {
    const newCharId = `char-${Date.now()}`;
    const newCharacter = {
      id: newCharId,
      name: name || `Character ${tracks.length}`,
      type: 'character',
      clips: [],
      subTracks: [
        { name: 'Action', clips: [] },
        { name: 'Dialogue', clips: [] },
        { name: 'Facial', clips: [] },
        { name: 'Look', clips: [] }
      ]
    };
    setTracks([...tracks, newCharacter]);
  };

  const handleDeleteCharacter = (trackId: string) => {
    setTracks(tracks.filter(track => track.id !== trackId));

    // 포커스 방어 로직: 삭제된 캐릭터가 현재 포커스된 상태였다면 포커스를 camera로 초기화
    if (focusedTrackId?.startsWith(trackId)) {
      handleSetFocusedTrackId('camera');
    }
    if (lastFocusedCharId === trackId) {
      setLastFocusedCharId(null);
    }
  };

  // Helper function to resolve clip overlap collisions
  const getValidStartPos = (clips: any[], initialPos: number, length: number) => {
    let pos = initialPos;
    let hasOverlap = true;
    while (hasOverlap) {
      hasOverlap = false;
      for (const c of (clips || [])) {
        const cEnd = c.startPos + c.length;
        const newEnd = pos + length;
        // If new clip overlaps with existing clip c
        if (pos < cEnd && newEnd > c.startPos) {
          pos = cEnd; // Move startPos to the end of this overlapping clip
          hasOverlap = true;
          break; // Re-evaluate all clips with the new pos
        }
      }
    }
    return pos;
  };

  const handleAddClip = (itemName: string, category: string = 'Action'): any => {
    let newClip: any = null;
    const newClipId = `clip-${Date.now()}`;
    let trackIdForReturn = '';

    if (category === 'Camera') {
      handleSetFocusedTrackId('camera');
      const cameraTrack = tracks.find(t => t.id === 'camera');
      const validPos = getValidStartPos(cameraTrack?.clips || [], playheadPos, 3);
      newClip = { id: newClipId, name: itemName, startPos: validPos, length: 3, trackId: 'camera', category: 'Camera' };
      trackIdForReturn = 'camera';

      setTracks(currentTracks => {
        return currentTracks.map(track => {
          if (track.id === 'camera') {
            return {
              ...track,
              clips: [...(track.clips || []), newClip]
            };
          }
          return track;
        });
      });
    } else {
      let targetCharId = focusedTrackId;
      let targetSubTrack = category;

      // 1 & 2. If trying to add character clip but focus is on camera or nothing
      if (targetCharId === 'camera' || !targetCharId) {
        const charTracks = tracks.filter(t => t.type === 'character');
        if (charTracks.length === 0) {
          setErrorMessage('캐릭터 트랙을 생성해주세요.');
          setTimeout(() => setErrorMessage(null), 2000);
          return null;
        }

        let newTargetId = lastFocusedCharId;
        if (!newTargetId || !charTracks.some(t => t.id === newTargetId)) {
          newTargetId = charTracks[0].id;
        }

        targetCharId = `${newTargetId}-${category}`;
        handleSetFocusedTrackId(targetCharId);
      }

      if (targetCharId && targetCharId.includes('-')) {
        const parts = targetCharId.split('-');
        if (parts.length >= 3) {
          targetCharId = `${parts[0]}-${parts[1]}`;
          if (parts[2].toLowerCase() !== category.toLowerCase()) {
            handleSetFocusedTrackId(`${targetCharId}-${category}`);
          }
        }
      }

      const charTrack = tracks.find(t => t.id === targetCharId && t.type === 'character');
      const subTrack = charTrack?.subTracks?.find((s: any) => s.name.toLowerCase() === targetSubTrack.toLowerCase());
      const validPos = getValidStartPos(subTrack?.clips || [], playheadPos, 3);
      newClip = { id: newClipId, name: itemName, startPos: validPos, length: 3 };
      trackIdForReturn = `${targetCharId}-${category}`;

      setTracks(currentTracks => {
        return currentTracks.map(track => {
          if (track.type === 'character' && track.id === targetCharId && track.subTracks) {
            const updatedSubTracks = track.subTracks.map((sub: any) => {
              if (sub.name.toLowerCase() === targetSubTrack.toLowerCase()) {
                return {
                  ...sub,
                  clips: [...(sub.clips || []), newClip]
                };
              }
              return sub;
            });
            return { ...track, subTracks: updatedSubTracks };
          }
          return track;
        });
      });
    }

    if (newClip) {
      setPlayheadPos(newClip.startPos);
      return { trackId: trackIdForReturn, clipId: newClipId, name: itemName, category, ...newClip };
    }
    return null;
  };

  const handleReplaceClip = (trackId: string, clipId: string, newItemName: string) => {
    const validClipId = clipId || targetClip?.clipId || targetClip?.id;

    setTracks(currentTracks => {
      return currentTracks.map(track => {
        // 1 & 2. Check main track clips
        if (track.id === trackId && track.clips) {
          return {
            ...track,
            clips: track.clips.map((c: any) => c.id === validClipId ? { ...c, name: newItemName } : c)
          };
        }

        // 3 & 4. Check nested subTracks
        if (track.type === 'character' && track.subTracks) {
          const updatedSubTracks = track.subTracks.map((sub: any) => {
            const currentSubTrackId = `${track.id}-${sub.name}`;

            if (currentSubTrackId === trackId || track.id === trackId) {
              return {
                ...sub,
                clips: sub.clips ? sub.clips.map((c: any) => c.id === validClipId ? { ...c, name: newItemName } : c) : []
              };
            }
            return sub;
          });
          return { ...track, subTracks: updatedSubTracks };
        }

        return track;
      });
    });

    setTargetClip((prev: any) => {
      if (prev && (prev.clipId === validClipId || prev.id === validClipId)) {
        return { ...prev, name: newItemName };
      }
      return prev;
    });

    setSelectedClip((prev: any) => {
      if (prev && (prev.clipId === validClipId || prev.id === validClipId)) {
        return { ...prev, name: newItemName };
      }
      return prev;
    });
  };

  const handleCancelPreview = () => {
    setPendingClip(null);
    if (targetClip) {
      setPanelMode('replace');
    } else {
      setPanelMode('default');
    }
  };

  const handleApplyPreview = () => {
    if (!pendingClip) return;

    if (targetClip) {
      // 1. 기존 클립 교체(Replace) 모드
      handleReplaceClip(targetClip.trackId, targetClip.clipId, pendingClip.name);
      setTargetClip({ ...targetClip, name: pendingClip.name });
      setPanelMode('replace');
    } else {
      // 2. 순수 추가(Add) 모드에서 넘어온 경우
      handleAddClip(pendingClip.name, pendingClip.category);
      setPanelMode('default');
    }

    setPendingClip(null);
  };

  const handleAddDialogueClip = (characterTrackId: string): any => {
    let newClip: any = null;
    setTracks(currentTracks => {
      let clipAdded = false;
      const newTracks = currentTracks.map(track => {
        if (track.type === 'character' && track.id === characterTrackId && track.subTracks) {
          const updatedSubTracks = track.subTracks.map((sub: any) => {
            if (sub.name.toLowerCase() === 'dialogue') {
              clipAdded = true;
              const validPos = getValidStartPos(sub.clips || [], playheadPos, 3);
              newClip = { id: `clip-dialogue-${Date.now()}`, name: 'Dialogue', startPos: validPos, length: 3, text: '' };
              return {
                ...sub,
                clips: [
                  ...(sub.clips || []),
                  newClip
                ]
              };
            }
            return sub;
          });
          return { ...track, subTracks: updatedSubTracks };
        }
        return track;
      });
      return clipAdded ? newTracks : currentTracks;
    });

    if (newClip) {
      setPlayheadPos(newClip.startPos);
      return { trackId: `${characterTrackId}-Dialogue`, category: 'Dialogue', ...newClip };
    }
    return null;
  };

  const handleDeleteClip = (trackId: string, clipId: string) => {
    setTracks(currentTracks => {
      return currentTracks.map(track => {
        // 1 & 2. 최상위 트랙의 id가 trackId와 일치하면 해당 트랙의 clips 배열에서 clipId를 filter로 제거
        if (track.id === trackId && track.clips) {
          return {
            ...track,
            clips: track.clips.filter((c: any) => c.id !== clipId)
          };
        }

        // 3. 만약 최상위 트랙이 캐릭터 트랙(subTracks를 가진 경우)이라면,
        if (track.type === 'character' && track.subTracks) {
          // 그 안의 subTracks 배열도 map으로 순회
          const updatedSubTracks = track.subTracks.map((sub: any) => {
            const currentSubTrackId = `${track.id}-${sub.name}`;

            // 4. subTracks 중 하나의 id가 trackId와 일치한다면 (부모 id 호환성 포함)
            if (currentSubTrackId === trackId || track.id === trackId) {
              return {
                ...sub,
                // 하위 트랙의 clips 배열에서 clipId를 filter로 제거한 뒤 상태 업데이트
                clips: sub.clips ? sub.clips.filter((c: any) => c.id !== clipId) : []
              };
            }
            return sub;
          });
          // 중첩 객체 불변성 유지 반환
          return { ...track, subTracks: updatedSubTracks };
        }

        return track;
      });
    });
  };

  const handleEditClipRequest = (trackId: string, clipId: string) => {
    // Find the clip name and category
    let clipName = '';
    let category = 'Action'; // default fallback
    tracks.forEach(track => {
      // 1. Check if it's in the top-level track clips (usually Camera)
      if (track.id === trackId && track.clips) {
        const c = track.clips.find((c: any) => c.id === clipId);
        if (c) {
          clipName = c.name;
          category = track.type === 'system' ? 'Camera' : track.name;
        }
      }
      // 2. Check if it's inside character subtracks
      if (track.type === 'character' && track.subTracks) {
        track.subTracks.forEach((sub: any) => {
          if (sub.clips) {
            const c = sub.clips.find((c: any) => c.id === clipId);
            if (c) {
              clipName = c.name;
              category = sub.name; // e.g., 'Action', 'Look', 'Facial', 'Dialogue'
            }
          }
        });
      }
    });

    setTargetClip({ trackId, clipId, name: clipName, category });
    setPanelMode('edit');
    setActiveTab(category.toLowerCase()); // Open corresponding panel context
  };

  const handleReplaceClipRequest = (trackId: string, clipId: string) => {
    let clipName = '';
    let category = 'Action'; // default fallback
    tracks.forEach(track => {
      if (track.id === trackId && track.clips) {
        const c = track.clips.find((c: any) => c.id === clipId);
        if (c) {
          clipName = c.name;
          category = track.type === 'system' ? 'Camera' : track.name;
        }
      }
      if (track.type === 'character' && track.subTracks) {
        track.subTracks.forEach((sub: any) => {
          if (sub.clips) {
            const c = sub.clips.find((c: any) => c.id === clipId);
            if (c) {
              clipName = c.name;
              category = sub.name;
            }
          }
        });
      }
    });

    setTargetClip({ trackId, clipId, name: clipName, category });
    setPanelMode('replace');
    setActiveTab(category.toLowerCase()); // Open corresponding panel context
  };

  const toggleSidebar = (targetId: string) => {
    if (activeTab === targetId) {
      // Revert modes when closing
      setActiveTab('default');
    } else {
      setActiveTab(targetId);
    }
    setPanelMode('default');
    setTargetClip(null);
    setPendingClip(null);
  };

  // Compile all dialogue clips sorted by startPos
  const allDialogueClips = React.useMemo(() => {
    let dialogues: any[] = [];
    tracks.forEach(track => {
      if (track.type === 'character' && track.subTracks) {
        const dialogueTrack = track.subTracks.find((sub: any) => sub.name.toLowerCase() === 'dialogue');
        if (dialogueTrack && dialogueTrack.clips) {
          dialogueTrack.clips.forEach((clip: any) => {
            dialogues.push({ ...clip, characterName: track.name, characterId: track.id });
          });
        }
      }
    });
    return dialogues.sort((a, b) => a.startPos - b.startPos);
  }, [tracks]);

  const isCameraView = (panelMode === 'edit' || panelMode === 'replace') && (targetClip?.category === 'Camera' || targetClip?.trackId === 'camera');

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden">
      {/* Upper Area: Sidebar + Panel + Main Viewport */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={toggleSidebar} />

        {/* Side Panel - 320px */}
        {activeTab && (
          <aside className={`w-[320px] flex-shrink-0 bg-white overflow-hidden flex flex-col relative transition-all duration-300 ${panelMode === 'edit' || panelMode === 'replace' || (panelMode === 'preview' && targetClip) ? 'm-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] ring-1 ring-black/5 z-30' : 'border-r border-gray-200 z-20'}`}>
            {/* Dim Overlay for Camera Edit/Replace */}
            {(panelMode === 'edit' || panelMode === 'replace') && targetClip?.category === 'Camera' && selectedClip && selectedClip.id !== (targetClip.clipId || targetClip.id) && (
              <div
                className="absolute inset-0 bg-black/60 z-50 cursor-pointer flex items-center justify-center backdrop-blur-sm transition-all"
                onClick={() => {
                  if (setSelectedClip) setSelectedClip({ ...targetClip, id: targetClip.clipId || targetClip.id });
                }}
              >
                <div className="bg-black/50 px-4 py-2 rounded-full text-white font-medium text-sm drop-shadow-md border border-white/10 hover:bg-black/70 transition-colors">
                  Click to return focus
                </div>
              </div>
            )}
            {panelMode === 'edit' && targetClip?.category !== 'Dialogue' ? (
              <EditPanel
                targetClip={targetClip}
                closeEditPanel={closeEditPanel}
                onChangeRequest={() => {
                  setPanelMode('replace');
                }}
                onApply={() => {
                  setPanelMode('default');
                  setTargetClip(null);
                  console.log("Edit properties applied");
                }}
                selectedClip={selectedClip}
                setSelectedClip={setSelectedClip}
              />
            ) : activeTab === 'action' ? (
              <ActionPanel
                onClose={() => toggleSidebar('action')}
                onAddClip={handleAddClip}
                onReplaceClip={handleReplaceClip}
                panelMode={panelMode}
                setPanelMode={setPanelMode}
                targetClip={targetClip}
                setTargetClip={setTargetClip}
                pendingClip={pendingClip}
                selectedClip={selectedClip}
                setSelectedClip={setSelectedClip}
                onCancelPreview={handleCancelPreview}
                onApplyPreview={handleApplyPreview}
                handleAddDialogueClip={handleAddDialogueClip}
                allDialogueClips={allDialogueClips}
              />
            ) : activeTab === 'dialogue' ? (
              <DialoguePanel
                onClose={() => toggleSidebar('dialogue')}
                allDialogueClips={allDialogueClips}
                tracks={tracks}
                handleAddDialogueClip={handleAddDialogueClip}
                selectedClip={selectedClip}
                setSelectedClip={setSelectedClip}
              />
            ) : activeTab === 'camera' ? (
              <CameraPanel onClose={() => toggleSidebar('camera')} onAddClip={handleAddClip} onReplaceClip={handleReplaceClip} panelMode={panelMode} setPanelMode={setPanelMode} targetClip={targetClip} setTargetClip={setTargetClip} pendingClip={pendingClip} setPendingClip={setPendingClip} selectedClip={selectedClip} setSelectedClip={setSelectedClip} onCancelPreview={handleCancelPreview} onApplyPreview={handleApplyPreview} handleAddDialogueClip={handleAddDialogueClip} allDialogueClips={allDialogueClips} />
            ) : activeTab === 'facial' ? (
              <FacialPanel onClose={() => toggleSidebar('facial')} onAddClip={handleAddClip} onReplaceClip={handleReplaceClip} panelMode={panelMode} setPanelMode={setPanelMode} targetClip={targetClip} setTargetClip={setTargetClip} pendingClip={pendingClip} selectedClip={selectedClip} setSelectedClip={setSelectedClip} onCancelPreview={handleCancelPreview} onApplyPreview={handleApplyPreview} handleAddDialogueClip={handleAddDialogueClip} allDialogueClips={allDialogueClips} />
            ) : activeTab === 'character' ? (
              <CharacterPanel onClose={() => toggleSidebar('character')} onAddCharacter={handleAddCharacter} handleAddDialogueClip={handleAddDialogueClip} allDialogueClips={allDialogueClips} selectedClip={selectedClip} setSelectedClip={setSelectedClip} />
            ) : (
              <DefaultPanel />
            )}
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 relative bg-gray-50 overflow-hidden">
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px'
            }}
          />

          {/* 3D Viewport Placeholder Content */}
          <div className="relative z-0 w-full h-full">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  tracks,
                  onAddCharacter: handleAddCharacter,
                  playheadPos,
                  panelMode,
                  setPanelMode,
                  targetClip,
                  focusedTrackId,
                  setFocusedTrackId: handleSetFocusedTrackId,
                  errorMessage,
                  setErrorMessage,
                  lastFocusedCharId,
                  pendingClip,
                  setPendingClip,
                  isCameraView,
                  closeEditPanel,
                  selectedClip
                } as any);
              }
              return child;
            })}
          </div>
        </main>
      </div>

      <div
        className="h-2 flex-shrink-0 bg-gray-100 border-t border-gray-200 cursor-row-resize flex items-center justify-center"
        onMouseDown={handleTimelineResizeStart}
        title="타임라인 높이 조절"
      >
        <div className="w-10 h-1 rounded-full bg-gray-400/70" />
      </div>

      {/* Bottom Timeline */}
      <Timeline
        tracks={tracks}
        onAddCharacter={handleAddCharacter}
        onDeleteCharacter={handleDeleteCharacter}
        onDeleteClip={handleDeleteClip}
        onEditClip={handleEditClipRequest}
        onReplaceClip={handleReplaceClipRequest}
        onAddClip={handleAddClip}
        playheadPos={playheadPos}
        setPlayheadPos={setPlayheadPos}
        focusedTrackId={focusedTrackId}
        setFocusedTrackId={handleSetFocusedTrackId}
        panelMode={panelMode}
        pendingClip={pendingClip}
        handleAddDialogueClip={handleAddDialogueClip}
        allDialogueClips={allDialogueClips}
        setActiveTab={setActiveTab}
        setPanelMode={setPanelMode}
        targetClip={targetClip}
        setTargetClip={setTargetClip}
        selectedClip={selectedClip}
        setSelectedClip={setSelectedClip}
        closeEditPanel={closeEditPanel}
        timelineHeight={timelineHeight}
      />
    </div >
  );
};

export default Layout;
