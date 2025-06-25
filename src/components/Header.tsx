
import React, { useState, useEffect } from 'react';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import Globe from 'lucide-react/dist/esm/icons/globe';
import Clock from 'lucide-react/dist/esm/icons/clock';
import { useSpaceWeatherData } from '../hooks/useSpaceWeatherData';

const Header = () => {
  const { alerts, isLoading, currentFlux, kpIndex } = useSpaceWeatherData();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const activeAlertCount = alerts.filter(alert => alert.active).length;

  const getThreatLevel = () => {
    const hasXFlare = currentFlux && currentFlux.shortFlux >= 1e-4;
    const hasStorm = kpIndex && kpIndex.kpIndex >= 5;
    const hasCriticalAlert = alerts.some(alert => alert.severity === 'critical');

    if (hasXFlare || hasStorm || hasCriticalAlert) return 'critical';
    if (activeAlertCount > 0 || (kpIndex && kpIndex.kpIndex >= 3)) return 'moderate';
    return 'nominal';
  };

  const threatLevel = getThreatLevel();
  const threatColors = {
    nominal: 'text-aurora-green',
    moderate: 'text-solar-orange', 
    critical: 'text-solar-red'
  };

  const threatLabels = {
    nominal: 'SYSTEMS NOMINAL',
    moderate: 'ELEVATED CONDITIONS',
    critical: 'CRITICAL CONDITIONS'
  };

  // Show storm banner if there's a critical event
  const showStormBanner = threatLevel === 'critical' || activeAlertCount > 0;
  
  return (
    <header className="aetheria-header sticky top-0 z-50">
      {/* Storm banner - only shown when there's an active storm or alert */}
      {showStormBanner && (
        <div className="bg-solar-red bg-opacity-30 text-white p-1 text-center text-sm font-medium animate-pulse-subtle border-b border-solar-red">
          {threatLevel === 'critical' ? 'ACTIVE SPACE WEATHER STORM IN PROGRESS' : 'SPACE WEATHER ALERT: POTENTIAL STORM APPROACHING'}
        </div>
      )}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <div>
            <h1 className="text-3xl font-display font-bold cosmic-glow bg-gradient-to-r from-cosmic-purple via-cosmic-blue to-aurora-green bg-clip-text text-transparent">
              Aetheria
            </h1>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground font-medium">Space Weather Observatory</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Local Time Display */}
          <div className="aetheria-glass px-4 py-2 flex items-center space-x-3">
            <Clock className="h-5 w-5 text-cosmic-blue" />
            <div className="text-right">
              <div className="text-xs font-mono font-semibold">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {currentTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
          
          {/* Threat Level Indicator */}
          <div className="aetheria-glass px-4 py-2 flex items-center space-x-3">
            <div className="relative">
              <Globe className="h-5 w-5 text-cosmic-blue" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping ${
                threatLevel === 'critical' ? 'bg-solar-red' :
                threatLevel === 'moderate' ? 'bg-solar-orange' : 'bg-aurora-green'
              }`} />
            </div>
            <div className="text-right">
              <div className={`text-xs font-mono font-semibold ${threatColors[threatLevel]}`}>
                {threatLabels[threatLevel]}
              </div>
              <div className="text-xs text-muted-foreground">
                {isLoading ? 'SYNCING...' : 'REAL-TIME'}
              </div>
            </div>
          </div>

          {/* Alert Counter */}
          <div className={`aetheria-glass px-4 py-2 flex items-center space-x-3 ${
            activeAlertCount > 0 ? 'pulse-glow' : ''
          }`}>
            <div className="relative">
              <AlertTriangle className={`h-5 w-5 ${
                activeAlertCount > 0 ? 'text-solar-orange' : 'text-aurora-green'
              }`} />
              {activeAlertCount > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-solar-red rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{activeAlertCount}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className={`text-xs font-mono font-semibold ${
                activeAlertCount > 0 ? 'text-solar-orange' : 'text-aurora-green'
              }`}>
                {activeAlertCount > 0 ? `${activeAlertCount} ACTIVE` : 'ALL CLEAR'}
              </div>
              <div className="text-xs text-muted-foreground">ALERTS</div>
            </div>
          </div>

          {/* Live Status Indicator */}
          <div className="aetheria-glass px-3 py-2 flex items-center space-x-2">
            <div className="w-2 h-2 bg-aurora-green rounded-full animate-pulse" />
            <span className="text-xs font-mono text-aurora-green font-semibold">
              {isLoading ? 'SYNC' : 'LIVE'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
