import React, { useState } from 'react';
import { EraData, EraId, FaceDetectionResult } from '../types';
import { CameraCapture } from './CameraCapture';
import { ERAS } from '../constants';

interface SplashScreenProps {
  onStart: () => void;
  onSelectEra: (era: EraData) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onCapture?: (imageSrc: string, faceData: FaceDetectionResult, overrideEra?: EraData) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart, onSelectEra, isMuted, setIsMuted, onCapture }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleInteraction = () => {
    // Enable Audio if needed globally
    if (isMuted) {
      setIsMuted(false);
    }

    // Trigger Fullscreen
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    }
  };

  return (
    <div
      className="h-full w-full relative overflow-hidden bg-black"
      onClick={handleInteraction}
    >
      {/* Camera Capture Feed Layer */}
      {onCapture && (
        <div className="absolute inset-0 z-0">
          <CameraCapture
            era={ERAS.find(e => e.id === EraId.SNAP_A_MEMORY) || ERAS[0]}
            onCapture={(img, face) => {
              onCapture?.(img, face);
            }}
            onBack={() => { }}
            isSplash={true}
          />
        </div>
      )}

      {/* Background Image Layer */}
      <div
        className={`absolute inset-0 pointer-events-none z-10 transition-all duration-[1800ms] ease-in-out ${isExiting ? 'opacity-0 scale-110 blur-2xl' : 'opacity-100 scale-100'}`}
      >
        <img
          src="./Splash-Screen/Ramadan-Frame.png"
          alt="Ramadan Frame"
          className="w-full h-full object-fill pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Title Section Removed - Handled globally in App.tsx */}

      {/* Footer & Eras Layer Removed */}

    </div>
  );
};