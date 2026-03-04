import React from 'react';
import {
    Camera,
    Clapperboard,
    MessageSquare,
    Smile,
    User,
    Box,
    Palette,
    Image as ImageIcon,
} from 'lucide-react';

export const MENU_ITEMS = [
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'action', label: 'Action', icon: Clapperboard },
    { id: 'dialogue', label: 'Dialogue', icon: MessageSquare },
    { id: 'facial', label: 'Facial', icon: Smile },
    { id: 'character', label: 'Character', icon: User },
    { id: 'object', label: 'Object', icon: Box },
    { id: 'mood', label: 'Mood', icon: Palette },
    { id: 'scene', label: 'Scene', icon: ImageIcon },
];

interface SidebarProps {
    activeTab: string | null;
    onTabChange: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
    const handleMenuClick = (id: string) => {
        onTabChange(id);
    };

    return (
        <nav className="w-[64px] flex-shrink-0 bg-white flex flex-col items-center py-4 border-r border-gray-200 z-20">
            <div className="flex flex-col w-full space-y-2">
                {MENU_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleMenuClick(item.id)}
                            className={`
                w-full flex flex-col items-center justify-center py-3 gap-1 transition-colors duration-200 relative
                ${isActive ? 'text-[#7C5CFC]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
              `}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#7C5CFC] rounded-r-md transition-all duration-200" />
                            )}
                            <div className={`
                p-1.5 rounded-lg transition-colors duration-200
                ${isActive ? 'bg-[#7C5CFC]/10' : ''}
              `}>
                                <Icon size={24} strokeWidth={1.5} />
                            </div>
                            <span className={`text-[10px] font-medium leading-none transition-colors duration-200 ${isActive ? 'text-[#7C5CFC]' : 'text-gray-500'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default Sidebar;
