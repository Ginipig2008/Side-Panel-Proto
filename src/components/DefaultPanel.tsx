import React from 'react';

const DefaultPanel: React.FC = () => {
    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">Select a Tool</h3>
                <p className="text-gray-500 text-sm max-w-[200px]">
                    Click on any icon in the sidebar to open its settings.
                </p>
            </div>
        </div>
    );
};

export default DefaultPanel;
