
import React, { useState, useEffect } from 'react';
import { Sun, Activity, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SolarData {
  xrayClass: string;
  flareActivity: number;
  solarWind: number;
  kpIndex: number;
}

const SolarActivity = () => {
  const [solarData, setSolarData] = useState<SolarData>({
    xrayClass: 'C2.1',
    flareActivity: 3,
    solarWind: 425,
    kpIndex: 2.3
  });

  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setSolarData(prev => ({
        xrayClass: `${['C', 'M', 'X'][Math.floor(Math.random() * 3)]}${(Math.random() * 9 + 1).toFixed(1)}`,
        flareActivity: Math.floor(Math.random() * 10),
        solarWind: Math.floor(Math.random() * 200 + 300),
        kpIndex: Math.random() * 9
      }));
      setPulseAnimation(true);
      setTimeout(() => setPulseAnimation(false), 1000);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="relative">
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
              
              {/* Activity indicators */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 bg-solar-red rounded-full ${pulseAnimation ? 'animate-ping' : ''}`}
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

      {/* Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="data-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">X-Ray Class</p>
              <p className={`text-2xl font-bold font-mono ${getFlareColor(solarData.xrayClass)}`}>
                {solarData.xrayClass}
              </p>
            </div>
            <Zap className={`h-8 w-8 ${getFlareColor(solarData.xrayClass)}`} />
          </div>
          <div className="mt-3 h-2 bg-space-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${
                solarData.xrayClass.startsWith('X') 
                  ? 'from-solar-red to-red-600' 
                  : solarData.xrayClass.startsWith('M')
                  ? 'from-solar-orange to-orange-600'
                  : 'from-solar-yellow to-yellow-600'
              } transition-all duration-1000`}
              style={{ width: `${Math.min(parseFloat(solarData.xrayClass.slice(1)) * 10, 100)}%` }}
            />
          </div>
        </Card>

        <Card className="data-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Flare Activity</p>
              <p className="text-2xl font-bold font-mono text-aurora-blue">
                {solarData.flareActivity}/10
              </p>
            </div>
            <Activity className="h-8 w-8 text-aurora-blue" />
          </div>
          <div className="mt-3 h-2 bg-space-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-aurora-blue to-blue-600 transition-all duration-1000"
              style={{ width: `${solarData.flareActivity * 10}%` }}
            />
          </div>
        </Card>

        <Card className="data-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Solar Wind</p>
              <p className="text-2xl font-bold font-mono text-aurora-green">
                {solarData.solarWind} km/s
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-aurora-green/20 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-aurora-green animate-pulse" />
            </div>
          </div>
          <div className="mt-3 h-2 bg-space-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-aurora-green to-green-600 transition-all duration-1000"
              style={{ width: `${Math.min((solarData.solarWind - 300) / 5, 100)}%` }}
            />
          </div>
        </Card>

        <Card className="data-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Kp Index</p>
              <p className={`text-2xl font-bold font-mono ${getKpColor(solarData.kpIndex)}`}>
                {solarData.kpIndex.toFixed(1)}
              </p>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              solarData.kpIndex >= 5 ? 'bg-solar-red/20' : 
              solarData.kpIndex >= 3 ? 'bg-solar-orange/20' : 'bg-aurora-green/20'
            }`}>
              <div className={`h-3 w-3 rounded-full animate-pulse ${
                solarData.kpIndex >= 5 ? 'bg-solar-red' : 
                solarData.kpIndex >= 3 ? 'bg-solar-orange' : 'bg-aurora-green'
              }`} />
            </div>
          </div>
          <div className="mt-3 h-2 bg-space-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                solarData.kpIndex >= 5 ? 'bg-gradient-to-r from-solar-red to-red-600' : 
                solarData.kpIndex >= 3 ? 'bg-gradient-to-r from-solar-orange to-orange-600' : 
                'bg-gradient-to-r from-aurora-green to-green-600'
              }`}
              style={{ width: `${(solarData.kpIndex / 9) * 100}%` }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SolarActivity;
