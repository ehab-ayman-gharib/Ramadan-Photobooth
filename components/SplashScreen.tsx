import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
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
  const mountRef = useRef<HTMLDivElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const isExitingRef = useRef(false);

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



  useEffect(() => {
    if (!mountRef.current) return;

    // --- Scene Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Scene background should be transparent to see the image below

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 10;
    camera.position.y = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // --- Magical Particles ---
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 400; // Increased count for better look
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 30;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Create texture for glow
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 215, 0, 1)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.Texture(canvas);
    particleTexture.needsUpdate = true;

    const particlesMat = new THREE.PointsMaterial({
      size: 0.1,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xffd700
    });

    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);


    // --- Animation Loop ---
    let animationId: number;
    let time = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.01;

      const isExitingNow = isExitingRef.current;

      // Animate Particles
      particleSystem.rotation.y = time * 0.05;
      particleSystem.rotation.x = time * 0.02;

      if (isExitingNow) {
        particlesMat.opacity -= 0.02;
        camera.position.z -= 0.1;
      } else {
        camera.position.x = Math.sin(time * 0.2) * 0.5;
        camera.position.y = Math.cos(time * 0.1) * 0.5;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current) mountRef.current.innerHTML = '';
      renderer.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
    };
  }, []);

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

      {/* Title Section */}
      <div
        className={`absolute top-20 left-0 w-full z-10 flex flex-col items-center transition-all duration-[2200ms] ease-in-out ${isExiting ? 'opacity-0 -translate-y-10' : 'opacity-100 translate-y-0'}`}
      >
        <div className="relative w-4/5 max-w-lg">
          {/* Glow effect behind title */}
          <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full animate-pulse"></div>

          {/* Main Title Container */}
          <div className="relative flex flex-col items-center gap-3 px-8 py-6">
            <img
              src="./Splash-Screen/Ramadan-Kareem.png"
              alt="Ramadan Kareem"
              className="w-2/5 h-auto object-contain drop-shadow-2xl animate-pulse"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* Footer & Eras Layer Removed */}

      {/* Particles Layer (Three.js) */}
      <div ref={mountRef} className="absolute inset-0 z-[5] pointer-events-none" />

    </div>
  );
};