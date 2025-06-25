
import React, { useState, useEffect } from 'react';
import InteractiveLineChart from '@/components/ui/InteractiveLineChart';
import Radio from 'lucide-react/dist/esm/icons/radio';
import Zap from 'lucide-react/dist/esm/icons/zap';
import Activity from 'lucide-react/dist/esm/icons/activity';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';

interface FluxData {
  time: string;
  proton1: number;
  proton10: number;
  proton100: number;
  electron: number;
  f107: number;
}

interface RadioBurst {
  time: string;
  type: string;
  frequency: string;
}

const RadioFluxDashboard = () => {
  const [fluxData, setFluxData] = useState<FluxData[]>([]);
  const [radioBursts, setRadioBursts] = useState<RadioBurst[]>([]);
  const [selectedChart, setSelectedChart] = useState<'proton' | 'electron' | 'f107'>('proton');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching GOES particle flux data
    const generateMockData = () => {
      const data: FluxData[] = [];
      const now = new Date();
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
          time: time.toISOString(),
          proton1: Math.random() * 100 + 10,
          proton10: Math.random() * 50 + 5,
          proton100: Math.random() * 10 + 1,
          electron: Math.random() * 1000 + 100,
          f107: Math.random() * 50 + 120
        });
      }
      return data;
    };

    // Simulate radio burst events
    const generateRadioBursts = (): RadioBurst[] => [
      {
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        type: 'Type III',
        frequency: '25-180 MHz'
      },
      {
        time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        type: 'Type II',
        frequency: '25-180 MHz'
      }
    ];

    setFluxData(generateMockData());
    setRadioBursts(generateRadioBursts());
    setIsLoading(false);
  }, []);

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getChartData = () => {
    switch (selectedChart) {
      case 'proton':
        return {
          data: fluxData.map(d => ({
            time: formatTime(d.time),
            '>1 MeV': d.proton1,
            '>10 MeV': d.proton10,
            '>100 MeV': d.proton100
          })),
          lines: [
            { key: '>1 MeV', color: '#ff6b6b' },
            { key: '>10 MeV', color: '#4ecdc4' },
            { key: '>100 MeV', color: '#45b7d1' }
          ],
          title: 'Proton Flux',
          unit: 'particles/cm²/s/sr'
        };
      case 'electron':
        return {
          data: fluxData.map(d => ({
            time: formatTime(d.time),
            'Electrons': d.electron
          })),
          lines: [{ key: 'Electrons', color: '#a78bfa' }],
          title: 'Electron Flux',
          unit: 'electrons/cm²/s/sr'
        };
      case 'f107':
        return {
          data: fluxData.map(d => ({
            time: formatTime(d.time),
            'F10.7': d.f107
          })),
          lines: [{ key: 'F10.7', color: '#f59e0b' }],
          title: '10.7cm Solar Flux',
          unit: 'sfu'
        };
      default:
        return { data: [], lines: [], title: '', unit: '' };
    }
  };

  const chartConfig = getChartData();

  return (
    <div className="aetheria-glass p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Radio className="h-5 w-5 text-solar-orange" />
        <h3 className="text-lg font-display font-semibold cosmic-glow">
          Solar Radio & Particle Dashboard
        </h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-cosmic-blue border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Chart Selection */}
          <div className="flex space-x-2">
            {[
              { key: 'proton', label: 'Proton Flux', icon: Zap },
              { key: 'electron', label: 'Electron Flux', icon: Activity },
              { key: 'f107', label: 'F10.7 Flux', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedChart(key as any)}
                className={`aetheria-glass px-4 py-2 text-sm transition-all duration-200 hover:bg-white/10 ${
                  selectedChart === key ? 'ring-2 ring-cosmic-blue' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Main Chart */}
          <div className="aetheria-glass p-4">
            <div className="mb-4">
              <h4 className="font-semibold text-foreground">{chartConfig.title}</h4>
              <p className="text-sm text-muted-foreground">Last 24 hours • {chartConfig.unit}</p>
            </div>
            
            <div className="h-64">
              <InteractiveLineChart
                data={chartConfig.data}
                lines={chartConfig.lines}
                unit={chartConfig.unit}
                height="100%"
              />
            </div>
          </div>

          {/* Radio Burst Feed */}
          <div className="aetheria-glass p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Radio className="h-4 w-4 text-solar-orange" />
              <h4 className="font-semibold">Recent Radio Bursts</h4>
            </div>
            
            <div className="space-y-3">
              {radioBursts.length > 0 ? (
                radioBursts.map((burst, index) => (
                  <div key={index} className="flex items-center justify-between p-3 aetheria-glass">
                    <div>
                      <div className="font-medium text-sm">{burst.type} Radio Burst</div>
                      <div className="text-xs text-muted-foreground">{burst.frequency}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(burst.time)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Radio className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent radio bursts detected</p>
                </div>
              )}
            </div>
          </div>

          {/* S-Scale Thresholds */}
          <div className="grid grid-cols-3 gap-4">
            <div className="aetheria-glass p-3 text-center">
              <div className="text-lg font-mono text-aurora-green">S1</div>
              <div className="text-xs text-muted-foreground">Minor</div>
            </div>
            <div className="aetheria-glass p-3 text-center">
              <div className="text-lg font-mono text-solar-yellow">S2-S3</div>
              <div className="text-xs text-muted-foreground">Moderate</div>
            </div>
            <div className="aetheria-glass p-3 text-center">
              <div className="text-lg font-mono text-solar-red">S4-S5</div>
              <div className="text-xs text-muted-foreground">Severe</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RadioFluxDashboard;
