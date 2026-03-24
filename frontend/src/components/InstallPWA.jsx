import { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';

export const InstallPWA = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [deviceType, setDeviceType] = useState('desktop');

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    // Check if dismissed recently (24 hours)
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) return;
    }

    // Detect device
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }

    // For Android/Desktop
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Show after 2 seconds
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-xs relative">
        {/* Close */}
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-zinc-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-black border border-white flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8" />
          </div>
          
          <h2 className="font-display text-xl mb-2">Descarcă Aplicația</h2>
          <p className="text-zinc-400 text-sm mb-5">
            Adaugă pe telefon pentru programări rapide!
          </p>

          {/* Instructions */}
          <div className="bg-black/50 p-3 mb-5 text-left text-sm">
            {deviceType === 'ios' && (
              <>
                <p className="text-white font-bold mb-2">Pe iPhone:</p>
                <p className="text-zinc-400">1. Apasă <span className="text-white">Share (⬆️)</span></p>
                <p className="text-zinc-400">2. <span className="text-white">"Add to Home Screen"</span></p>
              </>
            )}
            {deviceType === 'android' && (
              <>
                <p className="text-white font-bold mb-2">Pe Android:</p>
                <p className="text-zinc-400">1. Apasă <span className="text-white">meniul (⋮)</span></p>
                <p className="text-zinc-400">2. <span className="text-white">"Add to Home screen"</span></p>
              </>
            )}
            {deviceType === 'desktop' && (
              <>
                <p className="text-white font-bold mb-2">Pe Desktop:</p>
                <p className="text-zinc-400">Apasă iconița de instalare din bara de adrese</p>
              </>
            )}
          </div>

          {/* Buttons */}
          {deferredPrompt ? (
            <button
              onClick={handleInstall}
              className="w-full bg-white text-black py-3 font-bold uppercase tracking-wider mb-2"
            >
              Instalează
            </button>
          ) : null}
          
          <button
            onClick={handleDismiss}
            className="w-full py-2 text-zinc-500 text-sm"
          >
            Mai târziu
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
