"use client";

import Layout from "@/components/Layout";
import { User, Eye, Camera, Users, Video, Grid, LogOut } from "lucide-react";

const Viewport = ({ tracks = [], errorMessage = null, panelMode = 'default', targetClip = null, isCameraView = false, setFocusedTrackId, closeEditPanel, setPanelMode, setTargetClip, selectedClip, activeAvatarClipState = {} }: any) => {
  const characters = tracks.filter((t: any) => t.type !== 'system');

  // 방어 코드: Layout에서 계산된 isCameraView 이외에도 Viewport 내부에서 직접 targetClip을 보고 안전하게 재계산합니다.
  const isSelectedClipCamera = selectedClip && selectedClip.id === targetClip?.id;
  const isCamera = isCameraView || ((panelMode === 'edit' || panelMode === 'replace') && (targetClip?.category === 'Camera' || targetClip?.trackId === 'camera'));

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden bg-[#5ba4e5]">
      {/* Background visual to represent 3D sky (image 1 & 2 have a blue sky) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4facfe] to-[#8ebfee] opacity-80"></div>

      {/* Floor grid representing 3D space */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[60%] before:absolute before:inset-0"
        style={{
          perspective: '1000px',
        }}
      >
        <div
          className="absolute inset-0 origin-bottom border-t border-gray-300 bg-[#f4f4f4]"
          style={{
            transform: 'rotateX(75deg)',
            backgroundImage: `
              linear-gradient(to right, #ccc 1px, transparent 1px),
              linear-gradient(to bottom, #ccc 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            boxShadow: 'inset 0 100px 100px -100px rgba(0,0,0,0.2)'
          }}
        />
      </div>

      {/* Error Message Popup */}
      {errorMessage && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 text-white font-medium px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-all">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {!isCamera && panelMode === 'preview' ? (
        <div className="absolute top-24 flex items-center gap-3 text-white drop-shadow-md animate-pulse z-10">
          <Eye size={28} />
          <h2 className="text-2xl font-bold">Camera Preview</h2>
        </div>
      ) : !isCamera && (
        <h2 className="absolute top-24 text-2xl font-bold text-white/80 drop-shadow-md z-10">3D Viewport Area</h2>
      )}

      {/* Characters in Viewport */}
      <div className="flex items-center justify-center gap-12 flex-wrap px-8 z-10 relative mt-20">
        {characters.length === 0 ? (
          <p className="text-white/80 text-lg font-medium drop-shadow-sm">현재 씬에 캐릭터가 없습니다.</p>
        ) : (
          characters.map((char: any) => (
            (() => {
              const avatarState = activeAvatarClipState[char.id] || {};
              const actionName = avatarState.action?.name || "Idle";
              const dialogueName = avatarState.dialogue?.name || "-";
              return (
                <div
                  key={char.id}
                  onClick={() => setFocusedTrackId?.(char.id)}
                  className="flex flex-col items-center justify-center w-36 h-44 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/40 hover:shadow-2xl hover:border-[#7C5CFC]/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex flex-col items-center justify-center mb-4 text-gray-500 border border-gray-200 shadow-inner">
                    <User size={32} strokeWidth={1.5} />
                  </div>
                  <span className="font-bold text-gray-800 text-sm truncate w-full text-center px-3 tracking-tight">
                    {char.name}
                  </span>
                  <span className="text-[10px] text-[#7C5CFC] font-semibold mt-1.5 uppercase tracking-widest bg-[#7C5CFC]/10 px-2.5 py-0.5 rounded-full">
                    Avatar
                  </span>
                  <div className="mt-2 px-2 w-full space-y-0.5">
                    <p className="text-[10px] text-gray-600 truncate text-center">Action: {actionName}</p>
                    <p className="text-[10px] text-gray-500 truncate text-center">Dialogue: {dialogueName}</p>
                  </div>
                </div>
              );
            })()
          ))
        )}
      </div>

      {/* --- CAMERA VIEW OVERLAY (Rendered only when isCamera is true) --- */}
      {isCamera && (
        <div className="absolute inset-0 pointer-events-none z-30 flex">
          {/* Top Left Text */}
          <div className="absolute top-6 left-6 z-50">
            <h2 className="text-3xl font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">
              Camera View
            </h2>
          </div>

          {/* Left Letterbox */}
          <div className="w-12 md:w-24 bg-black h-full flex-shrink-0 border-r border-white/10"></div>

          {/* Center Camera HUD */}
          <div className="flex-1 h-full relative flex flex-col items-center justify-center">

            {/* Rule of Thirds Grid Lines */}
            <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-white/20"></div>
            <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-white/20"></div>
            <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-white/20"></div>
            <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-white/20"></div>

            {/* Center Focus Square (Face Area) */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-48 h-56 border border-white/60 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <div className="absolute top-0 bottom-0 left-1/3 w-[1px] bg-white/30"></div>
              <div className="absolute top-0 bottom-0 right-1/3 w-[1px] bg-white/30"></div>
              <div className="absolute left-0 right-0 top-1/3 h-[1px] bg-white/30"></div>
              <div className="absolute left-0 right-0 bottom-1/3 h-[1px] bg-white/30"></div>
              {/* Center Focus Dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-red-400/80 rounded-full"></div>
            </div>

            {/* Top Info Pill */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md text-white rounded-full px-5 py-1.5 flex items-center gap-5 text-[11px] font-semibold tracking-wider shadow-md">
              <Video size={14} className="opacity-70" />
              <span className="opacity-90 relative before:absolute before:-left-5 before:top-1/2 before:-translate-y-1/2 before:w-[15px] before:border-b-2 before:border-dotted before:border-white/40 after:absolute after:-right-5 after:top-1/2 after:-translate-y-1/2 after:w-[15px] after:border-b-2 after:border-dotted after:border-white/40">461cm</span>
              <Users size={14} className="opacity-70 ml-2" />
            </div>

            {/* Bottom Info Pill */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/30 backdrop-blur-lg text-white rounded-3xl px-6 py-2 flex items-center gap-6 text-[11px] font-bold border border-white/40 shadow-xl">
              <div className="flex flex-col items-center">
                <Camera size={16} className="text-white drop-shadow-sm" />
                <span className="text-[8px] mt-0.5 opacity-90 uppercase tracking-widest">Auto</span>
              </div>
              <span className="opacity-90 tracking-widest relative before:absolute before:-left-6 before:top-1/2 before:-translate-y-1/2 before:w-[20px] before:border-b-2 before:border-dotted before:border-white/50 after:absolute after:-right-6 after:top-1/2 after:-translate-y-1/2 after:w-[20px] after:border-b-2 after:border-dotted after:border-white/50">100%</span>
              <Users size={16} className="opacity-90 drop-shadow-sm ml-2" />
            </div>

          </div>

          {/* Right Letterbox */}
          <div className="w-12 md:w-24 bg-black h-full flex-shrink-0 border-l border-white/10 relative">
            {/* Right Floating Vertical Panel */}
            <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto bg-white rounded-xl p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.15)] z-40">
              <button className="p-2.5 text-[#7C5CFC] bg-[#7C5CFC]/10 rounded-lg transition-colors hover:bg-[#7C5CFC]/20">
                <Video size={20} strokeWidth={2.5} />
              </button>
              <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center">
                <div className="font-bold text-lg select-none">#</div>
              </button>
              <button
                onClick={() => {
                  if (closeEditPanel) {
                    closeEditPanel();
                  } else if (setPanelMode) {
                    setPanelMode('default');
                    if (setTargetClip) setTargetClip(null);
                  }
                }}
                className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Exit Camera View"
              >
                <LogOut size={20} className="rotate-180" />
              </button>
            </div>
          </div>

          {/* Left Floating Horizontal Slider Panel */}
          <div className="absolute bottom-6 left-4 md:left-28 bg-white rounded-full px-5 py-2.5 flex items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.15)] pointer-events-auto z-40">
            <Video size={16} className="text-gray-600" />
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Slow</span>
            <div className="w-20 md:w-24 h-1.5 bg-gray-100 rounded-full relative cursor-pointer">
              <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-[#7C5CFC] rounded-full"></div>
              <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#7C5CFC] rounded-full shadow-md border-2 border-white ring-2 ring-[#7C5CFC]/30"></div>
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Fast</span>
          </div>

        </div>
      )}
    </div>
  );
};

export default function Home() {
  return (
    <Layout>
      <Viewport />
    </Layout>
  );
}
