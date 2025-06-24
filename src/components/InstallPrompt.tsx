import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import Download from 'lucide-react/dist/esm/icons/download';
import AndroidLogo from 'lucide-react/dist/esm/icons/smartphone';

// Interface for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// APK download URL pointing to the GitHub repository
const APK_DOWNLOAD_URL = 'https://github.com/cloudmafia/Aetheria/raw/apk-release/releases/aetheria-space-weather.apk';

const InstallPrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed (in standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsAndroid(/android/.test(userAgent));
    setIsIOS(/iphone|ipad|ipod/.test(userAgent) && !window.MSStream);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show our custom install dialog for Android
      if (/android/.test(userAgent)) {
        setTimeout(() => setIsOpen(true), 2000); // Show after 2 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the browser's install prompt
    await deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the saved prompt as it can't be used again
    setDeferredPrompt(null);
    setIsOpen(false);
  };

  // Don't render anything if the app is already installed or not on a mobile device
  if (isInstalled || (!isAndroid && !isIOS)) {
    return null;
  }

  // Function to handle APK download
  const handleApkDownload = () => {
    window.open(APK_DOWNLOAD_URL, '_blank');
  };

  return (
    <>
      {/* APK Download button - always visible at the top */}
      <div className="fixed top-4 right-4 z-50">
        <Button 
          onClick={handleApkDownload}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-2 shadow-lg"
        >
          <AndroidLogo size={18} />
          Download Android App
        </Button>
      </div>

      {/* Floating install button for Android users */}
      {isAndroid && deferredPrompt && !isOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 shadow-lg"
          >
            <Download size={18} />
            Install App
          </Button>
        </div>
      )}

      {/* Install dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install Aetheria Space Weather Dashboard</DialogTitle>
            <DialogDescription>
              Get the full experience with our installable app. Access space weather data even when offline!
            </DialogDescription>
          </DialogHeader>
          
          {isAndroid && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-3 rounded-lg">
                  <Download className="h-6 w-6 text-blue-300" />
                </div>
                <div>
                  <h4 className="font-medium">Install on your home screen</h4>
                  <p className="text-sm text-muted-foreground">Get quick access and work offline</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <AndroidLogo className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium">Download APK directly</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">For advanced users who prefer direct APK installation</p>
                <Button 
                  onClick={handleApkDownload}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700"
                >
                  Download APK File
                </Button>
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={handleInstallClick}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Install Now
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  Maybe Later
                </Button>
              </DialogFooter>
            </div>
          )}
          
          {isIOS && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <p>To install on iOS:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Tap the share icon <span className="inline-block px-2 py-1 bg-gray-100 rounded">⎙</span> at the bottom of your screen</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right corner</li>
                </ol>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  Got it
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallPrompt;
