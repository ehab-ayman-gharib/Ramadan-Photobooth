import React from 'react';
import { LogoOverlay } from './LogoOverlay';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm overflow-hidden animate-fade-in">
      {/* Background Overlay Arch */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="./Overlay.png"
          alt="Overlay Arch"
          className="w-full h-full object-fill opacity-100 scale-100"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full max-w-lg">
        {/* Center: Loading Visual */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            {/* Subtle glow behind the visual */}
            <div className="absolute inset-0 bg-yellow-400/10 blur-[60px] rounded-full animate-pulse-slow"></div>
            <img
              src="./Loading-Visual.png"
              alt="Loading..."
              className="w-72 md:w-96 h-auto object-contain relative z-10 animate-bounce-slow"
              draggable={false}
            />
          </div>

          {/* Progress Bar Area */}
          <div className="mt-16 w-3/4 md:w-full max-w-xs flex flex-col items-center gap-8">
            {/* Styled Progress Bar */}
            <div className="w-full h-[10px] bg-white/10 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-r from-[#C5A059] via-[#E5C07B] to-[#C5A059] w-full animate-progress-loading shadow-[0_0_20px_rgba(197,160,89,0.6)] rounded-full"></div>
            </div>

            {/* One Moment Text below the bar */}
            <img
              src="./One-Moment.png"
              alt="One Moment"
              className="w-44 md:w-56 h-auto object-contain drop-shadow-2xl"
              draggable={false}
            />
          </div>
        </div>
      </div>

      <LogoOverlay />
    </div>
  );
};

