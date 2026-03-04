import React from 'react';
import { Search, X } from 'lucide-react';

const CHARACTERS = [
    { id: 'vrm', label: 'VRM', count: 82 },
    { id: 'bleue', label: 'Bleue', count: 106 },
    { id: 'freyja', label: 'Freyja', count: 19 },
    { id: 'malcolm', label: 'Malcolm', count: 45 },
    { id: 'liam', label: 'Liam', count: 32 },
    { id: 'sophia', label: 'Sophia', count: 12 },
    { id: 'alex', label: 'Alex', count: 8 },
    { id: 'zoe', label: 'Zoe', count: 15 },
];

interface CharacterPanelProps {
    onClose: () => void;
    onAddCharacter: (name?: string) => void;
    handleAddDialogueClip?: (characterTrackId: string) => void;
    allDialogueClips?: any[];
    selectedClip?: any;
    setSelectedClip?: (clip: any) => void;
}

const CharacterPanel: React.FC<CharacterPanelProps> = ({ onClose, onAddCharacter, handleAddDialogueClip, allDialogueClips, selectedClip, setSelectedClip }) => {
    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="h-14 border-b border-gray-100 flex items-center px-4 justify-between gap-2 flex-shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search character..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:border-[#7C5CFC] transition-colors duration-200"
                    />
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {/* Banner */}
                <div className="w-full p-4 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6A4DF0] text-white shadow-lg relative overflow-hidden group cursor-pointer transition-transform duration-200 hover:scale-[1.02]">
                    <div className="relative z-10">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 mb-2 backdrop-blur-sm">
                            AVATARS
                        </span>
                        <h3 className="font-semibold text-lg leading-tight">Select Your Hero</h3>
                        <p className="text-white/80 text-xs mt-1">Diverse styles and personalities</p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                        <div className="w-24 h-24 rounded-full bg-white blur-xl" />
                    </div>
                </div>

                {/* Grid */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Characters</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {CHARACTERS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onAddCharacter && onAddCharacter(item.label)}
                                className="group relative flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#7C5CFC]/30 transition-all duration-200 text-left overflow-hidden aspect-[4/3]"
                            >
                                <div className="absolute inset-0 bg-gray-50 group-hover:bg-[#7C5CFC]/5 transition-colors duration-200" />
                                <div className="relative z-10 h-full flex flex-col justify-end p-3">
                                    <span className="font-medium text-gray-800 text-sm group-hover:text-[#7C5CFC] transition-colors duration-200 line-clamp-1">
                                        {item.label}
                                    </span>
                                    <span className="text-[10px] text-gray-500 group-hover:text-[#7C5CFC]/80 transition-colors duration-200">
                                        {item.count} items
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterPanel;
