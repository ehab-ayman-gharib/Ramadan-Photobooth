import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RefreshCw, AlertCircle, ChevronLeft } from 'lucide-react';
import { loadFaceApiModels, detectFaces } from '../services/faceService';
import { EraData, FaceDetectionResult, EraId } from '../types';
import { LogoOverlay } from './LogoOverlay';

interface CameraCaptureProps {
  era: EraData | null;
  onCapture: (image: string, faceData: FaceDetectionResult) => void;
  onBack: () => void;
  isProcessing?: boolean;
  isSplash?: boolean;
  hideUI?: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ era, onCapture, onBack, isProcessing = false, isSplash = false, hideUI = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const loaded = await loadFaceApiModels();
        setModelsLoaded(loaded);

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 720 },
            height: { ideal: 1280 }
          }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError("Camera access denied or unavailable.");
        console.error(err);
      }
    };
    init();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCaptureImmediate = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isDetecting) return;
    setIsDetecting(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Only apply 9:16 cropping for Snap a Memory mode
    // For AI modes, keep original aspect ratio (Gemini will output 9:16 anyway)
    const shouldCropTo916 = era?.id === EraId.SNAP_A_MEMORY;

    if (shouldCropTo916) {
      // Force 9:16 aspect ratio for Snap a Memory mode
      const targetAspectRatio = 9 / 16; // Portrait (width/height)
      const videoAspectRatio = video.videoWidth / video.videoHeight;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = video.videoWidth;
      let sourceHeight = video.videoHeight;

      // Crop to 9:16 if needed
      if (videoAspectRatio > targetAspectRatio) {
        // Video is wider than 9:16, crop the sides
        sourceWidth = video.videoHeight * targetAspectRatio;
        sourceX = (video.videoWidth - sourceWidth) / 2;
      } else if (videoAspectRatio < targetAspectRatio) {
        // Video is taller than 9:16, crop top/bottom
        sourceHeight = video.videoWidth / targetAspectRatio;
        sourceY = (video.videoHeight - sourceHeight) / 2;
      }

      // Set canvas to 9:16 aspect ratio
      const canvasWidth = 1080;
      const canvasHeight = 1920;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the cropped video feed to canvas at 9:16 ratio
        ctx.drawImage(
          video,
          sourceX, sourceY, sourceWidth, sourceHeight,  // Source crop
          0, 0, canvasWidth, canvasHeight               // Destination
        );
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        const faceData = await detectFaces(video, modelsLoaded);
        onCapture(imageData, faceData);
      }
    } else {
      // For AI modes: Keep original aspect ratio
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        const faceData = await detectFaces(video, modelsLoaded);
        onCapture(imageData, faceData);
      }
    }
    setIsDetecting(false);
  }, [era, modelsLoaded, onCapture, isDetecting]);

  // Store capture handler in ref to avoid effect dependency issues
  const captureRef = useRef(handleCaptureImmediate);
  useEffect(() => {
    captureRef.current = handleCaptureImmediate;
  }, [handleCaptureImmediate]);

  // Handle countdown logic
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Trigger Flash
      setShowFlash(true);

      const captureTimer = setTimeout(() => {
        captureRef.current?.();

        // Cleanup flash and countdown
        setTimeout(() => {
          setShowFlash(false);
          setCountdown(null);
        }, 800);
      }, 1000);
      return () => clearTimeout(captureTimer);
    }
  }, [countdown]);

  const startCaptureSequence = () => {
    if (countdown !== null || isDetecting) return;
    setCountdown(4);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-900">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-slate-400">{error}</p>
        <button onClick={onBack} className="mt-8 px-8 py-3 bg-slate-800 text-white rounded-full">Go Back</button>
      </div>
    );
  }

  return (
    <div className={`h-full w-full ${isSplash ? 'bg-transparent' : 'bg-black'} relative flex flex-col`}>
      {/* Video Feed - Full Screen Portrait */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform -scale-x-100"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>



      {/* Model Loading Overlay */}
      {!modelsLoaded && !error && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <RefreshCw className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
          <p className="text-white text-lg font-bold brand-font tracking-wider">INITIALIZING AI</p>
          <p className="text-slate-300 text-xs mt-2 font-mono">Loading neural networks...</p>
        </div>
      )}

      {/* Countdown Overlay */}
      {countdown !== null && countdown > 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 pointer-events-none">
          <div className="flex items-center justify-center animate-bounce-slow">
            {/* Countdown Text with Custom Font */}
            <span
              className={`relative z-10 font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-100 to-yellow-400 drop-shadow-[0_0_30px_rgba(234,179,8,0.6)] ${countdown === 1 ? 'text-5xl md:text-7xl' : 'text-8xl md:text-[12rem]'}`}
              style={{ fontFamily: "'ReemKufi', sans-serif" }}
            >
              {countdown === 1 ? 'جاهز ؟' : countdown - 1}
            </span>
          </div>
        </div>
      )}

      {/* Flash Effect */}
      {showFlash && (
        <div className="absolute inset-0 z-[100] bg-white animate-flash-out pointer-events-none" />
      )}

      {/* Header */}
      {!isProcessing && !isSplash && !hideUI && (
        <div className="absolute top-0 left-0 right-0 p-6 z-20 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
          <button
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Empty spacer for flex alignment */}
          <div className="w-12" />
        </div>
      )}

      {/* Footer Controls */}
      {!isProcessing && !hideUI && (
        <div className={`absolute bottom-0 left-0 right-0 p-10 z-20 flex flex-col items-center gap-6 ${isSplash ? 'pb-48 bg-transparent' : 'pb-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent'}`}>
          {/* Hint Text */}
          <p className="text-white text-2xl md:text-3xl font-bold arabic-font drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-pulse-slow">
            اضغط لتلتقط الصورة
          </p>

          <div className="flex justify-center items-center gap-8">
            {/* Capture Button */}
            <button
              onClick={startCaptureSequence}
              disabled={isDetecting || countdown !== null}
              className="group relative w-28 h-28 flex items-center justify-center focus:outline-none"
            >
              {/* Idle Pulse Ring - Only visible when idle */}
              {!isDetecting && countdown === null && (
                <div className="absolute inset-0 rounded-full border-[6px] border-white/30 animate-pulse-medium"></div>
              )}

              {/* Main Button Construction */}
              <div className={`
              relative w-20 h-20 rounded-full border-[4px] flex items-center justify-center transition-all duration-300 z-10 bg-black/20 backdrop-blur-sm
              ${isDetecting
                  ? 'border-slate-500 scale-95'
                  : countdown !== null
                    ? 'border-white scale-100' // Static during countdown
                    : 'border-white group-hover:scale-105 group-active:scale-95' // Interactive idle
                }
            `}>
                {/* Inner Shutter Circle */}
                <div className={`
                 rounded-full transition-all duration-300 shadow-sm
                 ${isDetecting
                    ? 'w-2 h-2 bg-slate-500 opacity-0'
                    : 'w-16 h-16 bg-white' // Simple white circle always
                  }
               `}></div>

                {/* Spinner Overlay */}
                {isDetecting && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      )}
      {/* 5dVR 10 years logo overlay */}
      <LogoOverlay hidden={hideUI} />
    </div>
  );
};