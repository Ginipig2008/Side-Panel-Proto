import React, { useState } from 'react';
import { X, User, Plus } from 'lucide-react';

interface DialoguePanelProps {
    onClose?: () => void;
    allDialogueClips?: any[];
    tracks?: any[];
    handleAddDialogueClip?: (characterTrackId: string) => void;
    selectedClip?: any;
    setSelectedClip?: (clip: any) => void;
}

const formatTimeRange = (startPos: number, length: number) => {
    const pad = (num: number) => num.toString().padStart(2, '0');

    // simplified time logic
    const startMins = Math.floor(startPos / 60);
    const startSecs = Math.floor(startPos % 60);
    const startFrames = Math.floor((startPos % 1) * 30);

    const endPos = startPos + length;
    const endMins = Math.floor(endPos / 60);
    const endSecs = Math.floor(endPos % 60);
    const endFrames = Math.floor((endPos % 1) * 30);

    return `00:${pad(startMins)}:${pad(startSecs)}-00:${pad(endMins)}:${pad(endSecs)}`;
};

const DialoguePanel: React.FC<DialoguePanelProps> = ({ onClose, allDialogueClips = [], tracks = [], handleAddDialogueClip }) => {
    const [isPending, setIsPending] = useState(false);

    const characterTracks = tracks.filter(t => t.type === 'character');

    const handleCharacterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const charId = e.target.value;
        if (charId && handleAddDialogueClip) {
            handleAddDialogueClip(charId);
            setIsPending(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="h-14 border-b border-gray-100 flex items-center px-4 justify-between flex-shrink-0">
                <span className="font-semibold text-gray-800 text-base">Dialogue</span>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-gray-50/50">
                {allDialogueClips.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                        <User size={32} className="mb-2 opacity-50" />
                        <span className="text-sm">No dialogue clips yet.</span>
                        <span className="text-xs mt-1">Add them from the timeline!</span>
                    </div>
                ) : (
                    allDialogueClips.map((clip, index) => (
                        <div key={clip.id || index} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                            {/* Card Header (Character Info & Time) */}
                            <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                                        <User size={14} />
                                    </div>
                                    <select className="text-xs font-medium text-gray-700 bg-transparent outline-none cursor-pointer">
                                        <option>{clip.characterName || 'Unknown Character'}</option>
                                    </select>
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono tracking-tighter">
                                    {formatTimeRange(clip.startPos, clip.length)}
                                </span>
                            </div>

                            {/* Card Body (Text Input) */}
                            <div className="p-3">
                                <textarea
                                    className="w-full text-sm text-gray-800 placeholder-gray-300 outline-none resize-none min-h-[60px]"
                                    placeholder="Enter dialogue text here..."
                                    defaultValue={clip.text || ''}
                                />
                            </div>
                        </div>
                    ))
                )}

                {/* Pending Card */}
                {isPending && (
                    <div className="bg-white rounded-xl border-2 border-dashed border-[#7C5CFC]/50 shadow-sm overflow-hidden flex flex-col opacity-80 animate-pulse">
                        <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-[#7C5CFC]/5">
                            <div className="flex items-center gap-2 w-full">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 flex-shrink-0">
                                    <User size={14} />
                                </div>
                                <select
                                    className="text-xs font-medium text-gray-700 bg-transparent outline-none cursor-pointer flex-1"
                                    defaultValue=""
                                    onChange={handleCharacterSelect}
                                >
                                    <option value="" disabled>Select Character...</option>
                                    {characterTracks.map(char => (
                                        <option key={char.id} value={char.id}>{char.name || 'Unknown Character'}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Button */}
                {!isPending && (
                    <div className="flex justify-center mt-4 pb-8">
                        <button
                            onClick={() => setIsPending(true)}
                            className="w-10 h-10 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center text-[#7C5CFC] hover:bg-[#7C5CFC]/5 hover:border-[#7C5CFC]/30 transition-all duration-200"
                        >
                            <Plus size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DialoguePanel;
