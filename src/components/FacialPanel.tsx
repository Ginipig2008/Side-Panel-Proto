import React, { useState, useEffect } from 'react';
import { Search, X, ChevronLeft, Smile, Check } from 'lucide-react';
import { facialData, FacialDataNode } from '../data/facialData';

export interface FacialPanelProps {
    onClose?: () => void;
    showCloseButton?: boolean;
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

const FacialPanel: React.FC<FacialPanelProps> = ({ onClose, showCloseButton = false, onAddClip, onReplaceClip, panelMode = 'default', setPanelMode, targetClip, setTargetClip, pendingClip, setPendingClip, selectedClip, setSelectedClip, onCancelPreview, onApplyPreview, handleAddDialogueClip, allDialogueClips }) => {
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
            <div className="border-b border-gray-100 px-4 py-3 flex-shrink-0 space-y-2">
                <div className="h-6 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800 text-base">Facial</h2>
                    {showCloseButton && onClose && (
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
                {facialPath.length > 0 ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBack}
                            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="font-medium text-gray-700 text-sm truncate flex items-center gap-2">
                            <Smile size={16} className="text-[#7C5CFC]" />
                            {currentFolder?.name}
                        </span>
                    </div>
                ) : (
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search expression..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:border-[#7C5CFC] transition-colors duration-200"
                        />
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {/* Grid */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        {facialPath.length > 0 ? 'Clips' : 'Categories'}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {(currentFolder ? currentFolder.children : facialData)?.map((item: FacialDataNode) => {
                            const isLeaf = !item.children || item.children.length === 0;
                            const isCurrent = panelMode === 'replace'
                                ? targetClip?.name === item.name
                                : false;
                            const isPending = panelMode === 'replace'
                                ? pendingClip?.name === item.name
                                : false;

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

                                            // 2. Replace 모드일 경우: 선택만 하고 하단 Apply로 확정
                                            if (panelMode === 'replace' && targetClip) {
                                                if (setPendingClip) setPendingClip({ name: item.name, category: 'Facial' });
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

                                    {/* Replace Indicators */}
                                    {isCurrent && (
                                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-blue-500 text-white text-[9px] font-bold tracking-wide shadow-sm">
                                            CURRENT
                                        </div>
                                    )}
                                    {isPending && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-[#7C5CFC] rounded-full flex items-center justify-center shadow-md">
                                            <Check size={12} className="text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                    {isPending && (
                                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-[#7C5CFC] text-white text-[9px] font-bold tracking-wide shadow-sm">
                                            NEW
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            {panelMode === 'replace' && targetClip && (
                <div className="border-t border-gray-100 p-4 flex-shrink-0 bg-white">
                    <button
                        onClick={() => {
                            if (!pendingClip || !onReplaceClip) return;
                            onReplaceClip(targetClip.trackId, targetClip.clipId, pendingClip.name);
                            if (setPendingClip) setPendingClip(null);
                            if (onClose) onClose();
                        }}
                        disabled={!pendingClip}
                        className="w-full py-2.5 rounded-lg bg-[#7C5CFC] text-sm font-medium text-white hover:bg-[#6A4DF0] transition-colors shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Apply
                    </button>
                </div>
            )}
        </div>
    );
};

export default FacialPanel;
