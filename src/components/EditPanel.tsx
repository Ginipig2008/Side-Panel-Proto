import React from 'react';
import { RefreshCw, X } from 'lucide-react';

interface EditPanelProps {
    targetClip: any;
    closeEditPanel: () => void;
    onApply: () => void;
    onChangeRequest: () => void;
    selectedClip?: any;
    setSelectedClip?: (clip: any) => void;
}

const EditPanel: React.FC<EditPanelProps> = ({ targetClip, closeEditPanel, onApply, onChangeRequest, selectedClip, setSelectedClip }) => {
    const category = targetClip?.category || 'Unknown';

    return (
        <div className="h-full flex flex-col bg-white relative">
            {/* 1. 상단 타이틀 */}
            <div className="h-14 border-b border-gray-100 flex items-center px-4 justify-between flex-shrink-0">
                <h2 className="font-bold text-gray-800 text-base">Edit Template</h2>
                <button onClick={closeEditPanel} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-20">
                {/* 2. 클립 이름 및 썸네일 영역 */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">{targetClip?.name || 'Selected Clip'}</h3>

                    {category === 'Action' ? (
                        <div className="flex">
                            <button
                                onClick={onChangeRequest}
                                className="bg-[#7C5CFC] hover:bg-[#6A4DF0] text-white text-[11px] font-medium px-4 py-2 rounded shadow-md flex items-center gap-1.5 transition-colors"
                            >
                                <RefreshCw size={12} />
                                Change
                            </button>
                        </div>
                    ) : (
                        <div className="h-32 bg-gray-800 rounded-lg relative overflow-hidden flex items-center justify-center border border-gray-200 shadow-inner">
                            <span className="text-gray-500 text-sm">Thumbnail Area</span>

                            {category !== 'LookAt' && category !== 'Look' && (
                                <button
                                    onClick={onChangeRequest}
                                    className="absolute left-2 bottom-2 bg-[#7C5CFC] hover:bg-[#6A4DF0] text-white text-[11px] font-medium px-2.5 py-1 rounded shadow-md flex items-center gap-1.5 transition-colors"
                                >
                                    <RefreshCw size={12} />
                                    Change
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* 4. 속성 영역 (임시) */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        {category} Properties
                    </h4>

                    <div className="space-y-4">
                        {category === 'Camera' ? (
                            <>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">Zoom</span>
                                        <span className="text-xs text-gray-500">1.0x</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#7C5CFC] w-1/3 rounded-full" />
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">Angle Detail</span>
                                        <span className="text-xs text-gray-500">0°</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#7C5CFC] w-1/2 rounded-full" />
                                    </div>
                                </div>
                            </>
                        ) : category === 'Action' ? (
                            <>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">Speed</span>
                                        <span className="text-xs text-gray-500">Normal</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#7C5CFC] w-1/2 rounded-full" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                                <span className="text-sm text-gray-400">Common properties for {category}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 5. 하단 고정 버튼 */}
            <div className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-100 flex gap-2 z-10">

                {category !== 'Action' && category !== 'Look' && (
                    <button
                        onClick={() => { }}
                        className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                        Reset
                    </button>
                )}
                <button
                    onClick={onApply}
                    className="flex-1 py-2 rounded-lg bg-[#7C5CFC] text-white text-sm font-medium hover:bg-[#6A4DF0] transition-colors shadow-sm"
                >
                    Apply
                </button>
            </div>
        </div>
    );
};

export default EditPanel;
