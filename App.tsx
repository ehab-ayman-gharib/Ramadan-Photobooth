import React, { useState } from 'react';
import { AppScreen, EraData, FaceDetectionResult, EraId } from './types';
import { SplashScreen } from './components/SplashScreen';
import { CameraCapture } from './components/CameraCapture';
import { LoadingScreen } from './components/LoadingScreen';
import { ResultScreen } from './components/ResultScreen';
import { EraSelection } from './components/EraSelection';
import { generateHistoricalImage } from './services/geminiService';
import { applyEraStamp } from './services/stampService';
import { ERAS } from './constants';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.SPLASH);
  const [selectedEra, setSelectedEra] = useState<EraData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [printImage, setPrintImage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [faceDetectionResult, setFaceDetectionResult] = useState<FaceDetectionResult | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [tempCapturedImage, setTempCapturedImage] = useState<string | null>(null);
  const [tempFaceData, setTempFaceData] = useState<FaceDetectionResult | null>(null);

  const handleStart = () => {
    setCurrentScreen(AppScreen.ERA_SELECTION);
  };

  const handleEraSelect = (era: EraData) => {
    setSelectedEra(era);
    setCurrentScreen(AppScreen.CAMERA);
  };

  const handleCapture = async (imageSrc: string, faceData: FaceDetectionResult, overrideEra?: EraData) => {
    const activeEra = overrideEra || selectedEra;

    // If no era is selected, we move to the selection screen
    if (!activeEra) {
      setTempCapturedImage(imageSrc);
      setTempFaceData(faceData);
      setCurrentScreen(AppScreen.ERA_SELECTION);
      return;
    }

    setFaceDetectionResult(faceData);
    setCurrentScreen(AppScreen.PROCESSING);

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`[Processing] Attempt ${attempts} / ${maxAttempts}...`);

        let resultImage = imageSrc;
        let resultPrompt = '';

        if (activeEra.isAiEnabled !== false) {
          // Run Gemini AI transformation for all eras except those with isAiEnabled: false
          const result = await generateHistoricalImage(imageSrc, activeEra, faceData);
          resultImage = result.image;
          resultPrompt = result.prompt;
        }

        setGeneratedPrompt(resultPrompt);

        // Digital version - With Frame but NO Margins
        const digitalFramed = await applyEraStamp(resultImage, activeEra, false);
        setGeneratedImage(digitalFramed);

        // Print version - With Frame AND Margins
        const printFramed = await applyEraStamp(resultImage, activeEra, true);
        setPrintImage(printFramed);

        setCurrentScreen(AppScreen.RESULT);
        return; // Success! Exit the function
      } catch (error) {
        console.error(`Attempt ${attempts} failed:`, error);
        if (attempts >= maxAttempts) {
          // All retries failed
          console.error("All processing attempts failed. Resetting to splash screen.");
          // Reset to splash screen like the New Adventure button
          handleRestart();
          setCurrentScreen(AppScreen.SPLASH);
        } else {
          // Wait a bit before retrying (optional delay)
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
  };

  const handleRestart = () => {
    setGeneratedImage(null);
    setPrintImage(null);
    setGeneratedPrompt('');
    setSelectedEra(null);
    setFaceDetectionResult(null);
    setTempCapturedImage(null);
    setTempFaceData(null);
    setSessionKey(prev => prev + 1);
    setCurrentScreen(AppScreen.SPLASH); // Go back to splash (camera)
  };

  const handleUpdateImage = (newImage: string) => {
    setGeneratedImage(newImage);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.SPLASH:
        return <SplashScreen onStart={handleStart} onSelectEra={handleEraSelect} isMuted={isMuted} setIsMuted={setIsMuted} onCapture={handleCapture} />;
      case AppScreen.ERA_SELECTION:
        return (
          tempCapturedImage ? (
            <EraSelection
              capturedImage={tempCapturedImage}
              onSelect={(era) => {
                setSelectedEra(era);
                if (tempFaceData) handleCapture(tempCapturedImage, tempFaceData, era);
              }}
            />
          ) : <SplashScreen onStart={handleStart} onSelectEra={handleEraSelect} isMuted={isMuted} setIsMuted={setIsMuted} onCapture={handleCapture} />
        );
      case AppScreen.CAMERA:
        return <CameraCapture era={selectedEra} onCapture={handleCapture} onBack={() => setCurrentScreen(AppScreen.ERA_SELECTION)} />;
      case AppScreen.PROCESSING:
        return <CameraCapture era={selectedEra} onCapture={handleCapture} onBack={() => setCurrentScreen(AppScreen.ERA_SELECTION)} isProcessing={true} />;
      case AppScreen.RESULT:
        return (
          selectedEra && generatedImage ? (
            <ResultScreen
              imageSrc={generatedImage}
              printImageSrc={printImage || generatedImage}
              prompt={generatedPrompt}
              era={selectedEra}
              faceData={faceDetectionResult}
              onRestart={handleRestart}
              onUpdateImage={handleUpdateImage}
            />
          ) : <LoadingScreen />
        );
      default:
        return <SplashScreen onStart={handleStart} />;
    }
  };

  return (
    <div className="h-[100dvh] w-screen bg-slate-900 text-slate-100 flex flex-col overflow-hidden relative">
      {currentScreen !== AppScreen.RESULT && (
        <img
          src="./Lantern.png"
          alt="Ramadan Lantern"
          className="absolute -top-2 left-6 w-32 md:w-40 z-[150] pointer-events-none animate-swing origin-top drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
        />
      )}
      {currentScreen !== AppScreen.RESULT && (
        <img
          src="./Splash-Screen/Ramadan-Kareem.png"
          alt="Ramadan Kareem"
          className="absolute top-28 left-1/2 -translate-x-1/2 w-36 md:w-44 z-[150] pointer-events-none drop-shadow-2xl animate-pulse"
        />
      )}
      <main className="flex-grow relative h-full w-full" key={sessionKey}>
        {renderScreen()}
        {currentScreen === AppScreen.PROCESSING && <LoadingScreen />}
      </main>
    </div>
  );
};

export default App;