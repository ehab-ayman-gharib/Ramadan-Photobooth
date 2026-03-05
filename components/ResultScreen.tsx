import React, { useState, useEffect } from 'react';
import { EraData, FaceDetectionResult } from '../types';
import { Download, RotateCcw, Share2, QrCode, Loader2, Printer, CheckCircle2, XCircle, Settings } from 'lucide-react';

interface ResultScreenProps {
  imageSrc: string;        // Digital version (No margins/frame)
  printImageSrc: string;   // Print version (With margins/frame)
  prompt: string;
  era: EraData;
  faceData: FaceDetectionResult | null;
  onRestart: () => void;
  onUpdateImage: (newImage: string) => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  imageSrc,
  printImageSrc,
  prompt,
  era,
  faceData,
  onRestart,
  onUpdateImage
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [printers, setPrinters] = useState<any[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>(localStorage.getItem('preferredPrinter') || '');
  const [showPrinterSettings, setShowPrinterSettings] = useState(false);
  const [printStatus, setPrintStatus] = useState<'idle' | 'printing' | 'success' | 'error'>('idle');

  const fetchPrinters = async () => {
    try {
      // Robust Electron detection
      const isElectron = !!(window && (window as any).require && (window as any).require('electron'));

      if (isElectron) {
        const { ipcRenderer } = (window as any).require('electron');
        const data = await ipcRenderer.invoke('get-printers');

        if (data && data.printers) {
          console.log('[Printer] Fetched printers:', data.printers.length);
          setPrinters(data.printers);

          // Priority: 
          // 1. Manually saved in LocalStorage from previous session
          // 2. Hardcoded in printer-config.json
          // 3. System Default
          let targetPrinter = selectedPrinter;
          if (!targetPrinter) {
            if (data.config && data.config.printerName) {
              targetPrinter = data.config.printerName;
            } else {
              const defaultP = data.printers.find((p: any) => p.isDefault);
              if (defaultP) targetPrinter = defaultP.name;
            }
            if (targetPrinter) setSelectedPrinter(targetPrinter);
          }
        }
      } else {
        console.warn('[Printer] Not running in Electron environment');
      }
    } catch (err) {
      console.error('[Printer] Failed to fetch printers:', err);
    }
  };

  useEffect(() => {
    fetchPrinters();
  }, []);

  useEffect(() => {
    if (showPrinterSettings) {
      fetchPrinters();
    }
  }, [showPrinterSettings]);

  const handlePrinterChange = (name: string) => {
    setSelectedPrinter(name);
    localStorage.setItem('preferredPrinter', name);
  };

  useEffect(() => {
    const uploadImage = async () => {
      if (!imageSrc) return;
      setIsUploading(true);
      try {
        // Convert image to JPG format
        const img = new Image();
        img.src = imageSrc;
        await new Promise((resolve) => { img.onload = resolve; });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        ctx.drawImage(img, 0, 0);

        // Convert to JPG blob with 90% quality
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => b ? resolve(b) : reject(new Error('Blob creation failed')),
            'image/jpeg',
            0.9
          );
        });

        const formData = new FormData();
        formData.append('image', blob, 'result.jpg');
        formData.append('folder', 'Ramadan-2026');
        formData.append('metadata', JSON.stringify({
          event: 'Ramadan-2026',
          photobooth_id: 'Ramadan-2026',
          era: era.name,
          prompt: prompt
        }));

        const response = await fetch('https://qr-web-api.vercel.app/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        setQrCodeUrl(data.qrCodeUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setIsUploading(false);
      }
    };

    uploadImage();
  }, [imageSrc]);

  const handleDownload = async () => {
    // Convert to JPG before downloading
    const img = new Image();
    img.src = imageSrc;
    await new Promise((resolve) => { img.onload = resolve; });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ramadan-2026-${era.id}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.9);
  };

  const handlePrint = async () => {
    // Check if running in Electron and have access to node integration
    const isElectron = navigator.userAgent.indexOf('Electron') !== -1;

    setPrintStatus('printing');

    if (isElectron && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        const result = await ipcRenderer.invoke('print-image', { imageSrc: printImageSrc, printerName: selectedPrinter });

        if (result.success) {
          setPrintStatus('success');
          setTimeout(() => setPrintStatus('idle'), 3000);
        } else {
          setPrintStatus('error');
          setTimeout(() => setPrintStatus('idle'), 4000);
        }
      } catch (e) {
        console.error('Electron print failed, falling back to browser print', e);
        browserPrint();
        setPrintStatus('idle');
      }
    } else {
      browserPrint();
      setPrintStatus('idle');
    }
  };

  const browserPrint = () => {
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.write(`
        <html>
          <head>
            <style>
              @page { margin: 0; size: auto; }
              body { margin: 0; display: flex; justify-content: center; align-items: center; background: white; }
              img { max-width: 100%; height: auto; display: block; }
            </style>
          </head>
          <body>
            <img src="${printImageSrc}" />
            <script>
              window.onload = () => {
                window.focus();
                window.print();
                setTimeout(() => {
                  window.parent.document.body.removeChild(window.frameElement);
                }, 1000);
              };
            </script>
          </body>
        </html>
      `);
      doc.close();
    }
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-950 flex flex-col items-center justify-center">
      {/* 0. Printer Setup Floating Button (Reference-style) */}
      <button
        onClick={() => setShowPrinterSettings(true)}
        className="absolute top-6 right-6 z-[150] w-16 h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all active:scale-90 group border-4 border-white/20"
        title="Printer Settings"
      >
        <Printer size={32} strokeWidth={2.5} />
      </button>

      {/* 1. Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="./Backgrounds/Generic-Background.jpg"
          alt="Background"
          className="w-full h-full object-cover brightness-[0.85]"
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      </div>

      {/* 2. Main Framed Image Display - Centered 2:3 */}
      <div className="relative z-10 w-full max-w-[90vw] h-[75vh] flex items-center justify-center mb-24 px-4 animate-scale-in">
        <div className="h-full aspect-[2/3] relative shadow-[0_20px_80px_rgba(0,0,0,0.8)] rounded-lg overflow-hidden border border-white/10">
          <img
            src={imageSrc}
            alt="Final Composition"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Printing Feedback Overlay */}
      {printStatus !== 'idle' && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-[110] flex flex-col items-center justify-center animate-scale-in">
          <div className="bg-black/90 backdrop-blur-xl border border-yellow-500/30 p-12 rounded-full flex flex-col items-center gap-6 shadow-[0_0_100px_rgba(0,0,0,0.9)] min-w-[300px]">
            {printStatus === 'printing' && (
              <>
                <div className="relative">
                  <Printer className="text-yellow-500 animate-bounce" size={64} />
                  <div className="absolute -inset-4 bg-yellow-500/20 blur-2xl rounded-full animate-pulse" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl font-black text-white uppercase tracking-widest">Printing...</span>
                  <span className="text-xs text-yellow-500/70 font-bold uppercase tracking-widest">Your memory is on its way</span>
                </div>
              </>
            )}

            {printStatus === 'success' && (
              <>
                <CheckCircle2 className="text-green-500 animate-in zoom-in-50 duration-500" size={64} />
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl font-black text-white uppercase tracking-widest">Completed!</span>
                  <span className="text-xs text-green-500/70 font-bold uppercase tracking-widest">Take your memory with you</span>
                </div>
              </>
            )}

            {printStatus === 'error' && (
              <>
                <XCircle className="text-red-500" size={64} />
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl font-black text-white uppercase tracking-widest">Printer Busy</span>
                  <span className="text-xs text-red-500/70 font-bold uppercase tracking-widest">Please check connection or paper</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 3. Action Bar - Positioned to align with the bottom space of Result-Screen.png */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center items-center px-12 gap-8">

        {/* PRINT & RESTART (Primary Functional Buttons) */}
        <div className="flex gap-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-3 px-8 py-4 bg-white hover:bg-slate-50 text-[#C19E5D] font-black rounded-xl transition-all shadow-xl active:scale-95 group uppercase tracking-widest border-2 border-[#C19E5D]/20 h-fit"
          >
            <Printer size={20} />
            Print
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-3 px-8 py-4 bg-white hover:bg-slate-50 text-[#C19E5D] font-black rounded-xl transition-all shadow-xl active:scale-95 group uppercase tracking-widest border-2 border-[#C19E5D]/20 h-fit"
          >
            <RotateCcw size={20} />
            Restart
          </button>
        </div>

        {/* QR Code Section */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 bg-white rounded-xl shadow-2xl p-2 flex items-center justify-center border-4 border-[#C19E5D]/30 relative">
              {isUploading ? (
                <Loader2 className="animate-spin text-[#C19E5D]" size={32} />
              ) : qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
              ) : (
                <QrCode className="text-slate-200" size={40} />
              )}

              {/* Download Button Overlayed */}
              <button
                onClick={handleDownload}
                className="absolute -top-3 -right-3 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white shadow-xl transition-all active:scale-95"
                title="Download Artifact"
              >
                <Download size={14} />
              </button>
            </div>
            <span className="text-[9px] text-white font-bold tracking-[0.2em] uppercase bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-md">scan qr</span>
          </div>
        </div>
      </div>

      {/* Printer Settings Overlay (Rest omitted for brevity but same logic) */}
      {showPrinterSettings && (
        <div className="absolute inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          {/* ... printer settings content same as before ... */}
          <div className="bg-slate-900 border border-yellow-500/30 p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-yellow-500">Printer Settings</h2>
              <button onClick={() => setShowPrinterSettings(false)} className="text-slate-400">✕</button>
            </div>
            <div className="space-y-4">
              {printers.length > 0 ? (
                printers.map(p => (
                  <button key={p.name} onClick={() => handlePrinterChange(p.name)} className={`w-full text-left p-4 rounded-xl border ${selectedPrinter === p.name ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/10'}`}>
                    {p.name} {p.isDefault && "(Default)"}
                  </button>
                ))
              ) : <p className="text-slate-500">No printers found</p>}
            </div>
            <button onClick={() => setShowPrinterSettings(false)} className="w-full mt-8 py-4 bg-yellow-600 text-black font-bold rounded-xl">Close</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};