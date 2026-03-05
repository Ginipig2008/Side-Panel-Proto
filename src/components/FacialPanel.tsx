import React, { useState, useEffect } from 'react';
import { Search, X, ChevronLeft, Smile, Check } from 'lucide-react';
import { facialData, FacialDataNode } from '../data/facialData';

export interface FacialPanelProps {
    onClose?: () => void;
    onAddClip?: (itemName: string, category?: string) => any;
    onReplaceClip?: (trackId: string, clipId: string, newItemName: string) => void;
    panelMode?: 'default' | 'edit' | 'replace' | 'preview';
    targetClip?: any;
    pendingClip?: { name: string, category: string } | null;
    onCancelPreview?: () => void;
    onApplyPreview?: () => void;
    handleAddDialogueClip?: (characterTrackId: string) => void;
    allDialogueClips?: any[];
    setPanelMode?: (mode: 'default' | 'edit' | 'replace' | 'preview') => void;
    setTargetClip?: (clip: any) => void;
    setPendingClip?: (clip: { name: string, category: string } | null) => void;
    selectedClip?: any;
    setSelectedClip?: (clip: any) => void;
}

const FacialPanel: React.FC<FacialPanelProps> = ({ onClose, onAddClip, onReplaceClip, panelMode = 'default', setPanelMode, targetClip, setTargetClip, pendingClip, setPendingClip, selectedClip, setSelectedClip, onCancelPreview, onApplyPreview, handleAddDialogueClip, allDialogueClips }) => {
    const [facialPath, setFacialPath] = useState<FacialDataNode[]>([]);

    const handleBack = () => {
        setFacialPath([]);
        if (panelMode === 'replace') {
            setPanelMode?.('default');
            setTargetClip?.(null);
        }
    };

    useEffect(() => {
        if (panelMode === 'replace' && targetClip?.name) {
            let foundPath: FacialDataNode[] = [];

            const findNodePath = (nodes: FacialDataNode[], currentPath: FacialDataNode[]): boolean => {
                for (const node of nodes) {
                    if (!node.children || node.children.length === 0) {
                        if (node.name === targetClip.name) {
                            foundPath = currentPath;
                            return true;
                        }
                    } else {
                        if (findNodePath(node.children, [...currentPath, node])) {
                            return true;
                        }
                    }
                }
                return false;
            };

            findNodePath(facialData, []);
            if (foundPath.length > 0) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setFacialPath(foundPath);
            }
        }
    }, [panelMode, targetClip]);

    const currentFolder = facialPath.length > 0 ? facialPath[0] : null;

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="h-14 border-b border-gray-100 flex items-center px-4 justify-between gap-2 flex-shrink-0">
                {facialPath.length > 0 ? (
                    <div className="flex items-center gap-2 flex-1 relative">
                        <button
                            onClick={handleBack}
                            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="font-semibold text-gray-800 text-base truncate flex items-center gap-2">
                            <Smile size={16} className="text-[#7C5CFC]" />
                            {currentFolder?.name}
                        </span>
                    </div>
                ) : (
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search expression..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:border-[#7C5CFC] transition-colors duration-200"
                        />
                    </div>
                )}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {/* Banner */}
                <div className="w-full p-4 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6A4DF0] text-white shadow-lg relative overflow-hidden group cursor-pointer transition-transform duration-200 hover:scale-[1.02]">
                    <div className="relative z-10">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 mb-2 backdrop-blur-sm">
                            EXPRESSIONS
                        </span>
                        <h3 className="font-semibold text-lg leading-tight">Emotional Depth</h3>
                        <p className="text-white/80 text-xs mt-1">Bring characters to life</p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                        <div className="w-24 h-24 rounded-full bg-white blur-xl" />
                    </div>
                </div>

                {/* Grid */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        {facialPath.length > 0 ? 'Clips' : 'Categories'}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {(currentFolder ? currentFolder.children : facialData)?.map((item: FacialDataNode) => {
                            const isLeaf = !item.children || item.children.length === 0;
                            const isSelected = panelMode === 'replace' && targetClip?.name === item.name;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (!isLeaf) {
                                            setFacialPath([item]);
                                        } else {
                                            // 1. 카메라 카테고리일 경우: 무조건 Preview 모드로 진입
                                            if ((item as any).category === 'Camera') {
                                                if (setPendingClip) setPendingClip({ name: item.name, category: 'Camera' });
                                                if (setPanelMode) setPanelMode('preview');
                                                return;
                                            }

                                            // 2. Replace 모드일 경우: 클립 교체 실행
                                            if (panelMode === 'replace' && targetClip && onReplaceClip) {
                                                onReplaceClip(targetClip.trackId, targetClip.clipId, item.name);
                                                return;
                                            }

                                            // 3. 그 외 (Default 모드 등): 새 클립 생성만 실행
                                            if (onAddClip) {
                                                onAddClip(item.name, 'Facial');
                                            }
                                        }
                                    }}
                                    className="group relative flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#7C5CFC]/30 transition-all duration-200 text-left overflow-hidden aspect-[4/3]"
                                >
                                    <div className={`absolute inset-0 transition-colors duration-200 ${isLeaf ? 'bg-[#7C5CFC]/5 group-hover:bg-[#7C5CFC]/10' : 'bg-gray-50 group-hover:bg-[#7C5CFC]/5'}`} />
                                    <div className="relative z-10 h-full flex flex-col justify-end p-3">
                                        <span className={`font-medium text-sm transition-colors duration-200 line-clamp-1 ${isLeaf ? 'text-[#7C5CFC] group-hover:text-[#6A4DF0]' : 'text-gray-800'}`}>
                                            {item.name}
                                        </span>
                                        {!isLeaf && (
                                            <span className="text-[10px] text-gray-500 group-hover:text-[#7C5CFC]/80 transition-colors duration-200 flex items-center justify-between mt-1">
                                                {item.children?.length || 0} variations
                                                <ChevronLeft size={12} className="text-gray-400 rotate-180" />
                                            </span>
                                        )}
                                    </div>
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
        </div>
    );
};

export default FacialPanel;
