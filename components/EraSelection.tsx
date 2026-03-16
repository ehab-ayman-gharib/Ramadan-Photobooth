import React from 'react';
import { EraData, EraId } from '../types';
import { ERAS } from '../constants';
import { CameraCapture } from './CameraCapture';
import { LogoOverlay } from './LogoOverlay';

interface EraSelectionProps {
    onSelect: (era: EraData) => void;
    capturedImage: string;
}

export const EraSelection: React.FC<EraSelectionProps> = ({ onSelect, capturedImage }) => {
    // Split eras for the layout (4 top, 3 bottom)
    // First 4 eras from constants
    const topEras = ERAS.filter(e => e.id !== EraId.SNAP_A_MEMORY).slice(0, 4);
    // Next 2 eras + camera button
    const bottomEras = ERAS.filter(e => e.id !== EraId.SNAP_A_MEMORY).slice(4, 6);
    const snapAMemory = ERAS.find(e => e.id === EraId.SNAP_A_MEMORY)!;

    return (
        <div className="relative h-full w-full flex flex-col items-center justify-center bg-black overflow-hidden">
            {/* Background - Live Camera Feed with blur and dimming */}
            <div className="absolute inset-0 z-0">
                <CameraCapture
                    era={null}
                    onCapture={() => { }}
                    onBack={() => { }}
                    isSplash={true}
                    hideUI={true}
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[15px]"></div>
            </div>

            {/* Ramadan Frame Decoration */}
            <div className="absolute inset-0 z-1 pointer-events-none flex items-center justify-center opacity-80">
                <img
                    src="./Splash-Screen/Ramadan-Frame.png"
                    className="w-full h-full object-fill"
                    alt="Ramadan Frame"
                />
            </div>

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-start animate-fade-in px-8">

                {/* Title Section Removed - Handled globally in App.tsx */}

                {/* Icons Area - Adjusted margin to stay below logo */}
                <div className="relative w-full max-w-5xl flex flex-col items-center justify-center flex-grow mt-40">

                    {/* Two Row Grid Layout */}
                    <div className="flex flex-col items-center gap-6 md:gap-10 w-full justify-center">

                        {/* Top Row: 4 Items */}
                        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                            {topEras.map((era) => (
                                <EraButton
                                    key={era.id}
                                    era={era}
                                    onClick={() => onSelect(era)}
                                />
                            ))}
                        </div>

                        {/* Bottom Row: 3 Items */}
                        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                            {bottomEras.map((era) => (
                                <EraButton
                                    key={era.id}
                                    era={era}
                                    onClick={() => onSelect(era)}
                                />
                            ))}
                            {/* Normal Photo - Camera Icon */}
                            <EraButton
                                key={snapAMemory.id}
                                era={snapAMemory}
                                onClick={() => onSelect(snapAMemory)}
                                isCamera={true}
                            />
                        </div>

                    </div>

                </div>
            </div>

            <LogoOverlay />
        </div>
    );
};

interface EraButtonProps {
    era: EraData;
    onClick: () => void;
    isCamera?: boolean;
}

const EraButton: React.FC<EraButtonProps> = ({ era, onClick, isCamera }) => {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center group outline-none"
        >
            <div className={`
                relative w-28 h-28 md:w-36 md:h-36 
                transition-all duration-300 group-hover:scale-110 
                active:scale-95
                group-hover:drop-shadow-[0_0_25px_rgba(197,160,89,0.5)]
            `}>
                <img
                    src={era.icon}
                    alt={era.name}
                    className="w-full h-full object-contain transition-all duration-500"
                />

                {/* Shiny overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
            </div>
        </button>
    );
};
