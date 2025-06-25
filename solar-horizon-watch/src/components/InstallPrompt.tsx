import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Smartphone, Download } from 'lucide-react/dist/esm/icons';

// Interface for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Direct APK download URL - Make sure this is hosted properly with the correct MIME type
// Using GitHub Releases for Android APK (application/vnd.android.package-archive)
// Latest APK from GitHub Releases
const APK_DOWNLOAD_URL = 'https://github.com/sarsiddi/Aetheria/releases/latest/download/aetheria-space-weather.apk';

// PWA installation URL
const PWA_URL = 'https://aetheria-space-weather.windsurf.build/';

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

  // Function to handle Android app installation
  const handleAndroidInstall = () => {
    // Open the installation dialog
    setIsOpen(true);
  };
  
  // Function to handle APK download with proper MIME type
  const handleApkDownload = () => {
    // Create an anchor element to force download with proper MIME type
    const link = document.createElement('a');
    link.href = APK_DOWNLOAD_URL;
    link.download = 'aetheria-space-weather.apk';
    // Set attribute to hint MIME type
    link.setAttribute('type', 'application/vnd.android.package-archive');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Enhanced Android Install buttons - PWA and APK options always visible at the bottom */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center items-center gap-4 z-50">
        <Button 
          onClick={handleAndroidInstall}
          className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-full px-6 py-3 shadow-xl font-medium text-base"
        >
          <Smartphone size={20} />
          Install PWA
        </Button>
        <Button 
          onClick={handleApkDownload}
          className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-full px-6 py-3 shadow-xl font-medium text-base animate-pulse"
        >
          <Download size={20} />
          Download APK
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
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium">Install as PWA</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Get the full app experience with offline access</p>
                <ol className="list-decimal pl-5 space-y-2 mb-3 text-sm">
                  <li>Tap <strong>Install Now</strong> below</li>
                  <li>When prompted, tap <strong>Add to Home Screen</strong></li>
                  <li>Enjoy the app with full offline functionality!</li>
                </ol>
                <Button 
                  onClick={handleInstallClick}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                >
                  Install Now
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex items-center gap-3 mb-2">
                  <Download className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium">Direct APK Download</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Download and install our Android app directly</p>
                <ol className="list-decimal pl-5 space-y-2 mb-3 text-sm">
                  <li>Tap <strong>Download APK</strong> below</li>
                  <li>Open the downloaded APK file</li>
                  <li>Follow installation prompts to complete setup</li>
                </ol>
                <Button 
                  onClick={handleApkDownload}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white"
                >
                  Download APK
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3 mb-2">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium">Benefits of PWA Installation</h4>
                </div>
                <ul className="text-sm text-muted-foreground mb-3 list-disc pl-5 space-y-1">
                  <li>Works offline - access data even without internet</li>
                  <li>Faster loading - optimized for your device</li>
                  <li>Automatic updates - always get the latest features</li>
                  <li>Reduced data usage - caches resources locally</li>
                </ul>
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
