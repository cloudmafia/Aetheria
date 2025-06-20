
import React from 'react';
import { Sun, AlertTriangle, Zap, Globe } from 'lucide-react';
import { useSpaceWeatherData } from '../hooks/useSpaceWeatherData';

const Header = () => {
  const { alerts, isLoading, currentFlux, kpIndex } = useSpaceWeatherData();
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

  return (
    <header className="aetheria-header sticky top-0 z-50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 relative">
              {/* Animated cosmic backdrop */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue animate-spin-slow opacity-20" />
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-solar-orange to-solar-red flex items-center justify-center">
                <Sun className="h-6 w-6 text-white animate-pulse" />
              </div>
              {/* Orbital rings */}
              <div className="absolute inset-0 border border-white/20 rounded-full animate-spin-slow" style={{ animationDuration: '30s' }} />
              <div className="absolute inset-2 border border-white/10 rounded-full animate-spin-slow" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-display font-bold cosmic-glow bg-gradient-to-r from-cosmic-purple via-cosmic-blue to-aurora-green bg-clip-text text-transparent">
              Aetheria
            </h1>
            <p className="text-sm text-muted-foreground font-medium">Space Weather Observatory</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
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
