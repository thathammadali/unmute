import React from 'react';

interface BarProps {
    children: React.ReactNode;
    isVisible: boolean;
    isReady: boolean;
    invertedTransform?: boolean;
}

export default function Bar({
    children,
    isVisible,
    isReady,
    invertedTransform = false,
}: BarProps) {
    return (
        <div
            className={`h-[calc(100vh-10rem)] ${isVisible ? 'w-100' : `w-0 ${invertedTransform ? '-translate-x-full' : 'translate-x-full'}`} ${isReady ? 'flex' : 'hidden'} flex-col items-center overflow-y-hidden ${invertedTransform ? 'rounded-r-2xl' : 'rounded-l-2xl'} bg-white p-2 transition-all duration-300`}
        >
            {children}
        </div>
    );
}
