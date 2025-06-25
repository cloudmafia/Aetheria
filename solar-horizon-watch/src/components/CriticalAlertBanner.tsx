
import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Zap } from 'lucide-react';
import { useSpaceWeatherData } from '../hooks/useSpaceWeatherData';

const CriticalAlertBanner = () => {
  const { solarFlares, kpIndex, alerts, currentFlux } = useSpaceWeatherData();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'flare' | 'geomagnetic' | 'general'>('general');

  useEffect(() => {
    let shouldShow = false;
    let message = '';
    let type: 'flare' | 'geomagnetic' | 'general' = 'general';

    // Check for X-class flares in the last 6 hours
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const recentXFlare = solarFlares.find(flare => 
      flare.classType.startsWith('X') && 
      new Date(flare.peakTime) > sixHoursAgo
    );

    if (recentXFlare) {
      shouldShow = true;
      message = `🚨 ${recentXFlare.classType} SOLAR FLARE DETECTED! - Peak at ${new Date(recentXFlare.peakTime).toLocaleTimeString()} UTC`;
      type = 'flare';
    }

    // Check for current X-ray flux indicating ongoing X-class activity
    if (currentFlux && currentFlux.shortFlux >= 1e-4) {
      const currentClass = currentFlux.shortFlux >= 1e-3 ? 
        `X${(currentFlux.shortFlux / 1e-3).toFixed(1)}` : 
        `M${(currentFlux.shortFlux / 1e-4).toFixed(1)}`;
      
      if (currentClass.startsWith('X')) {
        shouldShow = true;
        message = `🚨 ONGOING ${currentClass} SOLAR FLARE ACTIVITY - Current X-ray flux elevated`;
        type = 'flare';
      }
    }

    // Check for major geomagnetic storms (G3+)
    if (kpIndex && kpIndex.kpIndex >= 6) {
      shouldShow = true;
      const gScale = kpIndex.kpIndex >= 8 ? 'G4' : kpIndex.kpIndex >= 7 ? 'G3' : 'G2';
      message = `🚨 MAJOR GEOMAGNETIC STORM IN PROGRESS - ${gScale} conditions (Kp ${kpIndex.kpIndex.toFixed(1)})`;
      type = 'geomagnetic';
    }

    // Check for critical alerts
    const criticalAlert = alerts.find(alert => alert.severity === 'critical' && alert.active);
    if (criticalAlert && !shouldShow) {
      shouldShow = true;
      message = `🚨 ${criticalAlert.title.toUpperCase()}`;
      type = 'general';
    }

    if (shouldShow && !isDismissed) {
      setAlertMessage(message);
      setAlertType(type);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [solarFlares, kpIndex, alerts, currentFlux, isDismissed]);

  // Reset dismissed state when alert changes
  useEffect(() => {
    setIsDismissed(false);
  }, [alertMessage]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const getBannerStyle = () => {
    switch (alertType) {
      case 'flare':
        return 'bg-gradient-to-r from-red-600 via-red-500 to-orange-500';
      case 'geomagnetic':  
        return 'bg-gradient-to-r from-purple-600 via-red-500 to-pink-500';
      default:
        return 'bg-gradient-to-r from-red-600 to-red-500';
    }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${getBannerStyle()} text-white shadow-lg animate-fade-in`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {alertType === 'flare' ? (
                <Zap className="h-5 w-5 animate-pulse" />
              ) : (
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              )}
              <span className="font-bold text-lg">CRITICAL ALERT</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/30" />
            <p className="font-semibold text-sm md:text-base">
              {alertMessage}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="hidden sm:block text-xs font-mono bg-white/20 px-2 py-1 rounded">
              LIVE
            </span>
            <button
              onClick={handleDismiss}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Animated border effect */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-pulse" />
    </div>
  );
};

export default CriticalAlertBanner;
