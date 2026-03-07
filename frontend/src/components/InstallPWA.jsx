import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

export const InstallPWA = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return; // Don't show for 7 days after dismissing
    }

    // For Android/Desktop - listen for beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // For iOS - show after 3 seconds
    if (isIOSDevice) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div 
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-zinc-900 border border-zinc-700 p-4 z-50 animate-slide-up"
      data-testid="pwa-install-prompt"
    >
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-zinc-500 hover:text-white"
        aria-label="Închide"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-black border border-zinc-700 flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-display text-lg mb-1">Instalează Aplicația</h3>
          <p className="text-zinc-400 text-sm mb-3">
            Adaugă MEN'S HOUSE BARBER pe ecranul principal pentru acces rapid.
          </p>
          
          {isIOS ? (
            <p className="text-xs text-zinc-500">
              Apasă <span className="text-white">Share</span> apoi <span className="text-white">"Add to Home Screen"</span>
            </p>
          ) : (
            <button
              onClick={handleInstall}
              className="bg-white text-black px-4 py-2 text-sm uppercase tracking-wider font-bold hover:bg-zinc-200 transition-colors"
              data-testid="pwa-install-btn"
            >
              Instalează
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
