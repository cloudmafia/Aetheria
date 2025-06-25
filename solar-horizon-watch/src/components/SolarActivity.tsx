import React, { useState } from 'react';
import Sun from 'lucide-react/dist/esm/icons/sun';
import Zap from 'lucide-react/dist/esm/icons/zap';
import Activity from 'lucide-react/dist/esm/icons/activity';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import { Card } from '@/components/ui/card';
import { useSpaceWeatherData } from '../hooks/useSpaceWeatherData';

const SolarActivity = () => {
  const { 
    solarFlares, 
    currentFlux, 
    kpIndex, 
    solarWind,
    isLoading, 
    lastUpdate, 
    errors,
    refresh 
  } = useSpaceWeatherData();

  const [expandedFlare, setExpandedFlare] = useState<string | null>(null);

  const getCurrentFlareClass = () => {
    if (!currentFlux) return 'A0.0';
    
    const flux = currentFlux.shortFlux;
    if (flux >= 1e-3) return `X${(flux / 1e-3).toFixed(1)}`;
    if (flux >= 1e-4) return `M${(flux / 1e-4).toFixed(1)}`;
    if (flux >= 1e-5) return `C${(flux / 1e-5).toFixed(1)}`;
    if (flux >= 1e-6) return `B${(flux / 1e-6).toFixed(1)}`;
    return `A${(flux / 1e-7).toFixed(1)}`;
  };

  const getLastTwoFlares = () => {
    if (!solarFlares || solarFlares.length === 0) return [];
    
    // Sort by peak time and get the most recent two significant flares
    return solarFlares
      .filter(flare => ['X', 'M'].some(cls => flare.classType.startsWith(cls)))
      .sort((a, b) => new Date(b.peakTime).getTime() - new Date(a.peakTime).getTime())
      .slice(0, 2);
  };

  const getFlareCardClass = (flareClass: string) => {
    if (flareClass.startsWith('X')) return 'orbital-event-card flare-x';
    if (flareClass.startsWith('M')) return 'orbital-event-card flare-m';
    return 'orbital-event-card flare-c';
  };

  const getFlareIcon = (flareClass: string) => {
    if (flareClass.startsWith('X')) return '🔥';
    if (flareClass.startsWith('M')) return '⚡';
    return '✨';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZoneName: 'short'
      }),
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    };
  };

  const getThreatLevel = () => {
    const hasXFlare = solarFlares.some(flare => 
      flare.classType.startsWith('X') && 
      new Date(flare.peakTime).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );
    const currentXRay = getCurrentFlareClass();
    const hasStorm = kpIndex && kpIndex.kpIndex >= 5;

    if (hasXFlare || currentXRay.startsWith('X') || hasStorm) return 'critical';
    if (currentXRay.startsWith('M') || (kpIndex && kpIndex.kpIndex >= 3)) return 'moderate';
    return 'nominal';
  };

  const lastTwoFlares = getLastTwoFlares();
  const threatLevel = getThreatLevel();
  const currentXrayClass = getCurrentFlareClass();

  if (isLoading && !currentFlux) {
    return (
      <div className="relative">
        <div className="aetheria-glass text-center p-8">
          <div className="flex justify-center mb-4">
            <RefreshCw className="h-10 w-10 text-cosmic-purple animate-spin" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3 cosmic-glow">Initializing Aetheria</h2>
          <p className="text-muted-foreground">Establishing quantum link to space weather networks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section with Solar Activity Data */}
      <div className="text-center">
        <div className="aetheria-glass p-6 rounded-xl mb-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="bg-gradient-to-br from-solar-orange via-solar-red to-yellow-600 h-16 w-16 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full animate-pulse opacity-80" />
              {/* Solar surface texture */}
              <div className="absolute inset-0 rounded-full opacity-40 mix-blend-overlay" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='40' stroke='white' stroke-width='1' fill='none' opacity='0.2' /%3E%3C/svg%3E")`,
                animation: 'rotate 80s linear infinite'
              }} />
              {/* Current flare class */}
              <div className="relative z-10 text-3xl font-mono font-bold tracking-tighter">{currentXrayClass}</div>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold">Current X-Ray Flux</h3>
              <p className="text-sm text-muted-foreground">Solar Activity Level</p>
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-display font-bold mb-3">
          <span className={`cosmic-glow ${
            threatLevel === 'critical' ? 'text-solar-red' :
            threatLevel === 'moderate' ? 'text-solar-orange' : 'text-aurora-green'
          }`}>
            Space Weather: {threatLevel === 'critical' ? 'Storm Active' : 
                          threatLevel === 'moderate' ? 'Elevated' : 'Nominal'}
          </span>
        </h2>
        <p className="text-muted-foreground text-lg">Real-time orbital surveillance and threat assessment</p>
      </div>

      {/* Orbital Event Tracker - Last Two Flares */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-semibold cosmic-glow">Orbital Event Tracker</h3>
          <button 
            onClick={refresh}
            className="aetheria-button flex items-center space-x-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {lastTwoFlares.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lastTwoFlares.map((flare, index) => {
              const timeInfo = formatTime(flare.peakTime);
              const isExpanded = expandedFlare === `${flare.classType}-${index}`;
              
              return (
                <div key={index} className="space-y-4">
                  <div 
                    className={`${getFlareCardClass(flare.classType)} ${index === 0 ? 'pulse-glow' : ''}`}
                    onClick={() => setExpandedFlare(isExpanded ? null : `${flare.classType}-${index}`)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getFlareIcon(flare.classType)}</span>
                        <div>
                          <div className="text-2xl font-bold font-mono">
                            {flare.classType}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {index === 0 ? 'Latest Event' : 'Previous Event'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Peak Time</span>
                        <span className="font-mono">{timeInfo.time}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-mono">{timeInfo.date}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Region</span>
                        <span className="font-mono">{flare.sourceLocation || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Flare Details */}
                  {isExpanded && (
                    <div className="aetheria-glass p-6 space-y-4 animate-fade-in">
                      <h4 className="font-semibold text-lg">Event Analysis</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Onset:</span>
                          <div className="font-mono">{formatTime(flare.beginTime).time}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">End:</span>
                          <div className="font-mono">{formatTime(flare.endTime).time}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Active Region:</span>
                          <div className="font-mono">{flare.activeRegion}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <div className="font-mono">
                            {Math.round((new Date(flare.endTime).getTime() - new Date(flare.beginTime).getTime()) / 60000)} min
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-white/10">
                        <h5 className="font-medium mb-2">Impact Assessment</h5>
                        <p className="text-sm text-muted-foreground">
                          {flare.classType.startsWith('X') ? 
                            'Strong X-class flare likely causing widespread radio blackouts and potential satellite disruption.' :
                            'Moderate M-class flare may cause brief radio communications disruption on the sunlit side of Earth.'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="aetheria-glass p-8 text-center">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-semibold mb-2">No Recent Major Events</h4>
            <p className="text-muted-foreground">Solar activity remains within normal parameters</p>
          </div>
        )}
      </div>

      {/* Current Conditions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="data-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current X-Ray</p>
              <p className={`text-2xl font-bold font-mono ${
                currentXrayClass.startsWith('X') ? 'text-solar-red' :
                currentXrayClass.startsWith('M') ? 'text-solar-orange' : 'text-aurora-green'
              }`}>
                {currentXrayClass}
              </p>
            </div>
            <Zap className={`h-8 w-8 ${
              currentXrayClass.startsWith('X') ? 'text-solar-red' :
              currentXrayClass.startsWith('M') ? 'text-solar-orange' : 'text-aurora-green'
            }`} />
          </div>
          <div className="h-2 bg-black/20 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                currentXrayClass.startsWith('X') ? 'bg-gradient-to-r from-solar-red to-red-600' :
                currentXrayClass.startsWith('M') ? 'bg-gradient-to-r from-solar-orange to-orange-600' :
                'bg-gradient-to-r from-aurora-green to-green-600'
              }`}
              style={{ width: `${Math.min(parseFloat(currentXrayClass.slice(1)) * 15, 100)}%` }}
            />
          </div>
        </div>

        <div className="data-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Solar Wind</p>
              <p className="text-2xl font-bold font-mono text-cosmic-blue">
                {solarWind?.speed?.toFixed(0) || '420'} km/s
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-cosmic-blue/20 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-cosmic-blue animate-pulse" />
            </div>
          </div>
          <div className="h-2 bg-black/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cosmic-blue to-blue-600 transition-all duration-1000"
              style={{ width: `${Math.min(((solarWind?.speed || 420) - 300) / 5, 100)}%` }}
            />
          </div>
        </div>

        <div className="data-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Kp Index</p>
              <p className={`text-2xl font-bold font-mono ${
                (kpIndex?.kpIndex || 0) >= 5 ? 'text-solar-red' :
                (kpIndex?.kpIndex || 0) >= 3 ? 'text-solar-orange' : 'text-aurora-green'
              }`}>
                {kpIndex?.kpIndex?.toFixed(1) || '2.0'}
              </p>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              (kpIndex?.kpIndex || 0) >= 5 ? 'bg-solar-red/20' :
              (kpIndex?.kpIndex || 0) >= 3 ? 'bg-solar-orange/20' : 'bg-aurora-green/20'
            }`}>
              <div className={`h-3 w-3 rounded-full animate-pulse ${
                (kpIndex?.kpIndex || 0) >= 5 ? 'bg-solar-red' :
                (kpIndex?.kpIndex || 0) >= 3 ? 'bg-solar-orange' : 'bg-aurora-green'
              }`} />
            </div>
          </div>
          <div className="h-2 bg-black/20 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                (kpIndex?.kpIndex || 0) >= 5 ? 'bg-gradient-to-r from-solar-red to-red-600' :
                (kpIndex?.kpIndex || 0) >= 3 ? 'bg-gradient-to-r from-solar-orange to-orange-600' :
                'bg-gradient-to-r from-aurora-green to-green-600'
              }`}
              style={{ width: `${((kpIndex?.kpIndex || 0) / 9) * 100}%` }}
            />
          </div>
        </div>

        <div className="data-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">System Status</p>
              <p className="text-lg font-bold text-aurora-green">
                {Object.keys(errors).length > 0 ? 'PARTIAL' : 'OPTIMAL'}
              </p>
            </div>
            <Activity className="h-8 w-8 text-aurora-green" />
          </div>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground">
              Last sync: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolarActivity;
