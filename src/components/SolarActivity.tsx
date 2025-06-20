
import React from 'react';
import { Sun, Activity, Zap, RefreshCw } from 'lucide-react';
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

  const getCurrentFlareClass = () => {
    if (!currentFlux) return 'A0.0';
    
    const flux = currentFlux.shortFlux;
    if (flux >= 1e-3) return `X${(flux / 1e-3).toFixed(1)}`;
    if (flux >= 1e-4) return `M${(flux / 1e-4).toFixed(1)}`;
    if (flux >= 1e-5) return `C${(flux / 1e-5).toFixed(1)}`;
    if (flux >= 1e-6) return `B${(flux / 1e-6).toFixed(1)}`;
    return `A${(flux / 1e-7).toFixed(1)}`;
  };

  const getRecentFlares = () => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return solarFlares.filter(flare => {
      const flareTime = new Date(flare.peakTime);
      return flareTime >= last24h;
    }).length;
  };

  const getFlareColor = (xrayClass: string) => {
    if (xrayClass.startsWith('X')) return 'text-solar-red';
    if (xrayClass.startsWith('M')) return 'text-solar-orange';
    return 'text-solar-yellow';
  };

  const getKpColor = (kp: number) => {
    if (kp >= 5) return 'text-solar-red';
    if (kp >= 3) return 'text-solar-orange';
    return 'text-aurora-green';
  };

  const currentXrayClass = getCurrentFlareClass();
  const recentFlareCount = getRecentFlares();

  if (isLoading && !currentFlux) {
    return (
      <div className="relative">
        <Card className="data-card text-center p-8">
          <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
            <RefreshCw className="h-16 w-16 text-primary animate-spin" />
          </div>
          <h2 className="text-xl font-bold mb-2">Loading Solar Data...</h2>
          <p className="text-muted-foreground">Fetching real-time space weather information</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Data Status Indicator */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {Object.keys(errors).length > 0 && (
            <div className="text-solar-orange text-sm">
              ⚠️ Some data sources unavailable
            </div>
          )}
          {lastUpdate && (
            <div className="text-muted-foreground text-sm">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
        <button 
          onClick={refresh}
          className="flex items-center space-x-2 px-3 py-1 rounded-full bg-space-700/50 hover:bg-space-600/50 transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Main Solar Visualization */}
      <div className="relative mb-8">
        <Card className="data-card text-center p-8">
          <div className="relative inline-block">
            <div className="w-32 h-32 relative mx-auto mb-4">
              {/* Solar corona effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-solar-yellow via-solar-orange to-solar-red animate-spin-slow" 
                   style={{ filter: 'blur(4px)' }} />
              
              {/* Main sun body */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-solar-yellow to-solar-orange flex items-center justify-center">
                <Sun className="h-16 w-16 text-white animate-pulse-soft" />
              </div>
              
              {/* Recent flare indicators */}
              {recentFlareCount > 0 && [...Array(Math.min(recentFlareCount, 6))].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-solar-red rounded-full animate-ping"
                  style={{
                    top: `${20 + Math.sin(i * Math.PI / 3) * 40}%`,
                    left: `${50 + Math.cos(i * Math.PI / 3) * 40}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
            </div>
            
            <h2 className="text-xl font-bold mb-2">Solar Activity Status</h2>
            <p className="text-muted-foreground">Real-time monitoring of solar conditions</p>
          </div>
        </Card>
      </div>

      {/* Recent Flares Alert */}
      {recentFlareCount > 0 && (
        <Card className="data-card mb-6 p-4 border-solar-orange bg-solar-orange/10">
          <div className="flex items-center space-x-3">
            <Zap className="h-6 w-6 text-solar-orange" />
            <div>
              <h3 className="font-semibold text-solar-orange">Recent Solar Activity</h3>
              <p className="text-sm text-muted-foreground">
                {recentFlareCount} solar flare{recentFlareCount > 1 ? 's' : ''} detected in the last 24 hours
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="data-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current X-Ray Class</p>
              <p className={`text-2xl font-bold font-mono ${getFlareColor(currentXrayClass)}`}>
                {currentXrayClass}
              </p>
              {errors.currentFlux && (
                <p className="text-xs text-solar-orange mt-1">Data unavailable</p>
              )}
            </div>
            <Zap className={`h-8 w-8 ${getFlareColor(currentXrayClass)}`} />
          </div>
          <div className="mt-3 h-2 bg-space-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${
                currentXrayClass.startsWith('X') 
                  ? 'from-solar-red to-red-600' 
                  : currentXrayClass.startsWith('M')
                  ? 'from-solar-orange to-orange-600'
                  : 'from-solar-yellow to-yellow-600'
              } transition-all duration-1000`}
              style={{ width: `${Math.min(parseFloat(currentXrayClass.slice(1)) * 10, 100)}%` }}
            />
          </div>
        </Card>

        <Card className="data-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Recent Flares (24h)</p>
              <p className="text-2xl font-bold font-mono text-aurora-blue">
                {recentFlareCount}
              </p>
              {errors.solarFlares && (
                <p className="text-xs text-solar-orange mt-1">Data unavailable</p>
              )}
            </div>
            <Activity className="h-8 w-8 text-aurora-blue" />
          </div>
          <div className="mt-3 h-2 bg-space-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-aurora-blue to-blue-600 transition-all duration-1000"
              style={{ width: `${Math.min(recentFlareCount * 20, 100)}%` }}
            />
          </div>
        </Card>

        <Card className="data-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Solar Wind</p>
              <p className="text-2xl font-bold font-mono text-aurora-green">
                {solarWind?.speed?.toFixed(0) || '---'} km/s
              </p>
              {errors.solarWind && (
                <p className="text-xs text-solar-orange mt-1">Data unavailable</p>
              )}
            </div>
            <div className="h-8 w-8 rounded-full bg-aurora-green/20 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-aurora-green animate-pulse" />
            </div>
          </div>
          <div className="mt-3 h-2 bg-space-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-aurora-green to-green-600 transition-all duration-1000"
              style={{ width: `${Math.min(((solarWind?.speed || 400) - 300) / 5, 100)}%` }}
            />
          </div>
        </Card>

        <Card className="data-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Kp Index</p>
              <p className={`text-2xl font-bold font-mono ${getKpColor(kpIndex?.kpIndex || 0)}`}>
                {kpIndex?.kpIndex?.toFixed(1) || '---'}
              </p>
              {errors.kpIndex && (
                <p className="text-xs text-solar-orange mt-1">Data unavailable</p>
              )}
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
          <div className="mt-3 h-2 bg-space-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                (kpIndex?.kpIndex || 0) >= 5 ? 'bg-gradient-to-r from-solar-red to-red-600' : 
                (kpIndex?.kpIndex || 0) >= 3 ? 'bg-gradient-to-r from-solar-orange to-orange-600' : 
                'bg-gradient-to-r from-aurora-green to-green-600'
              }`}
              style={{ width: `${((kpIndex?.kpIndex || 0) / 9) * 100}%` }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SolarActivity;
