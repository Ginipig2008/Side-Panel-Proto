import React from 'react';
import { Search, X, Check } from 'lucide-react';

const SHOT_TYPES = [
    { id: 'closeup', label: 'Close Up', count: 82 },
    { id: 'bust', label: 'Bust Shot', count: 106 },
    { id: 'waist', label: 'Waist Shot', count: 19 },
    { id: 'knee', label: 'Knee Shot', count: 45 },
    { id: 'full', label: 'Full Shot', count: 32 },
    { id: 'extreme-long', label: 'Extreme Long', count: 12 },
    { id: 'dutch', label: 'Dutch Angle', count: 8 },
    { id: 'overhead', label: 'Overhead', count: 15 },
];

interface CameraPanelProps {
    onClose?: () => void;
    onAddClip?: (itemName: string, category?: string) => any;
    onReplaceClip?: (trackId: string, clipId: string, newItemName: string) => void;
    panelMode?: 'default' | 'edit' | 'replace' | 'preview';
    targetClip?: any;
    pendingClip?: { name: string, category: string } | null;
    setPendingClip?: (clip: { name: string, category: string } | null) => void;
    onCancelPreview?: () => void;
    onApplyPreview?: () => void;
    handleAddDialogueClip?: (characterTrackId: string) => void;
    allDialogueClips?: any[];
    setPanelMode?: (mode: 'default' | 'edit' | 'replace' | 'preview') => void;
    setTargetClip?: (clip: any) => void;
    selectedClip?: any;
    setSelectedClip?: (clip: any) => void;
}

const CameraPanel: React.FC<CameraPanelProps> = ({ onClose, onAddClip, onReplaceClip, panelMode, setPanelMode, targetClip, setTargetClip, pendingClip, setPendingClip, selectedClip, setSelectedClip, onCancelPreview, onApplyPreview, handleAddDialogueClip, allDialogueClips }) => {
    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="h-14 border-b border-gray-100 flex items-center px-4 justify-between gap-2 flex-shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search shot type..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:border-[#7C5CFC] transition-colors duration-200"
                    />
                </div>
                {/* Camera panel is default, so close button might be optional or disabled, but keeping for consistency if passed */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {panelMode === 'preview' ? (
                <div className="flex-1 flex flex-col justify-between p-4">
                    <div className="flex flex-col items-center justify-center pt-8">
                        <div className="w-24 h-24 rounded-full bg-[#7C5CFC]/10 flex items-center justify-center mb-4 border-2 border-[#7C5CFC]/20">
                            <span className="text-3xl">🎥</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Preview Shot</h3>
                        <p className="text-sm font-medium text-[#7C5CFC] px-4 py-1.5 bg-[#7C5CFC]/10 rounded-full">
                            {pendingClip?.name || 'Selected Shot'}
                        </p>
                        <p className="text-xs text-gray-400 mt-4 text-center max-w-[200px]">
                            Adjust the camera angles or length from the timeline after applying.
                        </p>
                    </div>

                    <div className="mt-auto pt-4 flex gap-3 border-t border-gray-100 pb-2">
                        <button
                            onClick={onCancelPreview}
                            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onApplyPreview}
                            className="flex-1 py-2.5 rounded-lg bg-[#7C5CFC] text-sm font-medium text-white hover:bg-[#6A4DF0] transition-colors shadow-sm"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                    {/* Banner */}
                    <div className="w-full p-4 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6A4DF0] text-white shadow-lg relative overflow-hidden group cursor-pointer transition-transform duration-200 hover:scale-[1.02]">
                        <div className="relative z-10">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 mb-2 backdrop-blur-sm">
                                NEW FEATURE
                            </span>
                            <h3 className="font-semibold text-lg leading-tight">Cinematic Angles</h3>
                            <p className="text-white/80 text-xs mt-1">Explore professional compositions</p>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                            <div className="w-24 h-24 rounded-full bg-white blur-xl" />
                        </div>
                    </div>

                    {/* Shot Type Grid */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Shot Types</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {SHOT_TYPES.map((shot) => {
                                const isSelected = panelMode === 'replace' && targetClip?.name === shot.label;
                                return (
                                    <button
                                        key={shot.id}
                                        onClick={() => {
                                            if (setPendingClip) {
                                                setPendingClip({ name: shot.label, category: 'Camera' });
                                            }
                                            if (setPanelMode) {
                                                setPanelMode('preview');
                                            }
                                        }} className="group relative flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#7C5CFC]/30 transition-all duration-200 text-left overflow-hidden aspect-[4/3]"
                                    >
                                        {/* Placeholder Image Area */}
                                        <div className="absolute inset-0 bg-gray-50 group-hover:bg-[#7C5CFC]/5 transition-colors duration-200" />

                                        {/* Content */}
                                        <div className="relative z-10 h-full flex flex-col justify-end p-3">
                                            <span className="font-medium text-gray-800 text-sm group-hover:text-[#7C5CFC] transition-colors duration-200 line-clamp-1">
                                                {shot.label}
                                            </span>
                                            <span className="text-[10px] text-gray-500 group-hover:text-[#7C5CFC]/80 transition-colors duration-200">
                                                {shot.count} items
                                            </span>
                                        </div>

                                        {/* Hover Effect Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

                                        {/* Select Indicator */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-[#7C5CFC] rounded-full flex items-center justify-center shadow-md">
                                                <Check size={12} className="text-white" strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CameraPanel;
