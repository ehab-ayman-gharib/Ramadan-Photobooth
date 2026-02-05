import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EraData, EraId } from '../types';
import { ERAS } from '../constants';
import { Camera } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
  onSelectEra: (era: EraData) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart, onSelectEra, isMuted, setIsMuted }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const isExitingRef = useRef(false);

  const unmuteVideo = () => {
    // Enable Audio
    if (videoRef.current && isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }

    // Trigger Fullscreen
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    }
  };

  const handleEraClick = (era: EraData) => {
    if (isExiting) return;
    unmuteVideo();

    setIsExiting(true);
    isExitingRef.current = true;
    setTimeout(() => {
      onSelectEra(era);
    }, 1800);
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
      onClick={unmuteVideo}
    >
      {/* Background Video Layer - Commented out as requested
      <div
        className={`absolute inset-0 transition-all duration-[1800ms] ease-in-out ${isExiting ? 'opacity-0 scale-110 blur-2xl' : 'opacity-100 scale-100'}`}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="./isis_test.mp4" type="video/mp4" />
        </video>
      </div> 
      */}

      {/* Title Section */}
      <div
        className={`absolute top-20 left-0 w-full z-10 flex flex-col items-center transition-all duration-[2200ms] ease-in-out ${isExiting ? 'opacity-0 -translate-y-10' : 'opacity-100 translate-y-0'}`}
      >
        <div className="relative">
          {/* Glow effect behind title */}
          <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full animate-pulse"></div>

          {/* Main Title Container */}
          <div className="relative flex flex-col items-center gap-3 px-8 py-6">
            {/* Arabic Title with Crescents */}
            <div className="flex items-center gap-4">
              <span className="text-yellow-500 text-3xl md:text-4xl animate-pulse">🌙</span>
              <h1 className="text-yellow-500 text-4xl md:text-6xl font-bold text-center animate-pulse" style={{ fontFamily: 'serif' }}>
                ليالي المحروسة
              </h1>
              <span className="text-yellow-500 text-3xl md:text-4xl animate-pulse">🌙</span>
            </div>

            {/* English Subtitle */}
            <p className="text-yellow-600/80 text-sm md:text-lg uppercase tracking-[0.3em] font-light text-center">
              Heritage Photo Booth • Cairo Spirit
            </p>
          </div>
        </div>
      </div>

      {/* Footer & Eras Layer */}
      <div
        className={`absolute bottom-0 left-0 w-full z-10 transition-all duration-[2200ms] ease-in-out ${isExiting ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}
      >
        <div className="relative flex flex-col items-center justify-end w-full pb-8">
          {/* Era Selection Row */}
          <div className="flex justify-center items-end gap-1 md:gap-4 mb-6 px-2 w-full max-w-7xl">
            {ERAS.map((era) => (
              <div
                key={era.id}
                className="flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-105 active:scale-95"
                onClick={() => handleEraClick(era)}
              >
                {/* Button Container */}
                <div className="relative w-[18.5vw] h-[31vw] md:w-40 md:h-64 flex items-center justify-center">
                  {/* Background with clip-path */}
                  <div
                    className="w-full h-full relative bg-gradient-to-b from-yellow-600/20 to-yellow-800/40 backdrop-blur-sm group-hover:from-yellow-500/30 group-hover:to-yellow-700/50 transition-all duration-300"
                    style={{
                      clipPath: 'polygon(10% 0%, 90% 0%, 100% 10%, 100% 100%, 0% 100%, 0% 10%)'
                    }}
                  >
                    {/* Text Label at Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-yellow-700/80 via-yellow-600/80 to-yellow-700/80 py-2 px-2 flex items-center justify-center">
                      <span className="text-white text-[10px] md:text-sm font-bold tracking-wider text-center">
                        {era.description.split(' - ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* SVG Border Overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                    <polygon
                      points="10%,0% 90%,0% 100%,10% 100%,100% 0%,100% 0%,10%"
                      fill="none"
                      stroke="rgb(234 179 8 / 0.5)"
                      strokeWidth="2"
                      className="group-hover:stroke-yellow-400 transition-all duration-300"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Image Underlying everything */}
          <div className="absolute bottom-0 left-0 w-full pointer-events-none -z-10">
            <img
              src="./Splash-Screen/Splash-Footer.png"
              alt=""
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Tap to Enter Pulsing Text */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-lg animate-pulse"></div>
              <div className="relative border-b border-t border-yellow-500/30 py-2 px-8">
                <span className="text-white text-sm uppercase tracking-[0.4em] font-light animate-pulse whitespace-nowrap">Choose your era</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Particles Layer (Three.js) */}
      <div ref={mountRef} className="absolute inset-0 z-[5] pointer-events-none" />

    </div>
  );
};