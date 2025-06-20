
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DataVisualization = () => {
  const [solarWindData, setSolarWindData] = useState<number[]>([]);
  const [xrayData, setXrayData] = useState<number[]>([]);
  const [kpData, setKpData] = useState<number[]>([]);

  useEffect(() => {
    // Generate initial mock data
    const generateData = (length: number, base: number, variance: number) => {
      return Array.from({ length }, () => base + (Math.random() - 0.5) * variance);
    };

    setSolarWindData(generateData(24, 400, 150));
    setXrayData(generateData(24, 2, 3));
    setKpData(generateData(24, 2, 4));

    // Simulate real-time updates
    const interval = setInterval(() => {
      setSolarWindData(prev => [...prev.slice(1), 400 + (Math.random() - 0.5) * 150]);
      setXrayData(prev => [...prev.slice(1), 2 + (Math.random() - 0.5) * 3]);
      setKpData(prev => [...prev.slice(1), 2 + (Math.random() - 0.5) * 4]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const SimpleChart = ({ data, color, unit, title }: { 
    data: number[], 
    color: string, 
    unit: string, 
    title: string 
  }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
        <div className="relative h-40">
          <svg className="w-full h-full" viewBox="0 0 400 160">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="0"
                y1={i * 40}
                x2="400"
                y2={i * 40}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            ))}
            
            {/* Data line */}
            <path
              d={`M ${data.map((value, index) => 
                `${(index / (data.length - 1)) * 400},${160 - ((value - min) / range) * 160}`
              ).join(' L ')}`}
              fill="none"
              stroke={color}
              strokeWidth="2"
              className="animate-fade-in"
            />
            
            {/* Data points */}
            {data.map((value, index) => (
              <circle
                key={index}
                cx={(index / (data.length - 1)) * 400}
                cy={160 - ((value - min) / range) * 160}
                r="3"
                fill={color}
                className="animate-fade-in"
              />
            ))}
          </svg>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground py-1">
            <span>{max.toFixed(1)} {unit}</span>
            <span>{((max + min) / 2).toFixed(1)} {unit}</span>
            <span>{min.toFixed(1)} {unit}</span>
          </div>
        </div>
        
        {/* Current value display */}
        <div className="mt-4 text-center">
          <span className="text-2xl font-bold font-mono" style={{ color }}>
            {data[data.length - 1]?.toFixed(1)} {unit}
          </span>
          <p className="text-sm text-muted-foreground">Current Value</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Real-Time Data</h2>
      
      <Tabs defaultValue="solar-wind" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-space-700">
          <TabsTrigger value="solar-wind" className="data-states">Solar Wind</TabsTrigger>
          <TabsTrigger value="xray" className="data-states">X-Ray Flux</TabsTrigger>
          <TabsTrigger value="kp-index" className="data-states">Kp Index</TabsTrigger>
        </TabsList>
        
        <TabsContent value="solar-wind" className="mt-6">
          <SimpleChart 
            data={solarWindData}
            color="#00ff88"
            unit="km/s"
            title="Solar Wind Speed (24-Hour)"
          />
        </TabsContent>
        
        <TabsContent value="xray" className="mt-6">
          <SimpleChart 
            data={xrayData}
            color="#ff8800"
            unit="W/m²"
            title="X-Ray Flux (24-Hour)"
          />
        </TabsContent>
        
        <TabsContent value="kp-index" className="mt-6">
          <SimpleChart 
            data={kpData}
            color="#3b82f6"
            unit=""
            title="Kp Index (24-Hour)"
          />
        </TabsContent>
      </Tabs>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="data-card text-center">
          <h3 className="font-semibold mb-2 text-foreground">Solar Wind Status</h3>
          <div className="text-3xl font-bold text-aurora-green mb-2">
            {solarWindData[solarWindData.length - 1]?.toFixed(0)} km/s
          </div>
          <p className="text-sm text-muted-foreground">
            {solarWindData[solarWindData.length - 1] > 500 ? 'Fast' : 
             solarWindData[solarWindData.length - 1] > 350 ? 'Normal' : 'Slow'} Speed
          </p>
        </Card>

        <Card className="data-card text-center">
          <h3 className="font-semibold mb-2 text-foreground">X-Ray Activity</h3>
          <div className="text-3xl font-bold text-solar-orange mb-2">
            C{(xrayData[xrayData.length - 1] * 2).toFixed(1)}
          </div>
          <p className="text-sm text-muted-foreground">Current Class</p>
        </Card>

        <Card className="data-card text-center">
          <h3 className="font-semibold mb-2 text-foreground">Geomagnetic Field</h3>
          <div className="text-3xl font-bold text-space-500 mb-2">
            {Math.abs(kpData[kpData.length - 1])?.toFixed(1)}
          </div>
          <p className="text-sm text-muted-foreground">
            {Math.abs(kpData[kpData.length - 1]) < 3 ? 'Quiet' : 
             Math.abs(kpData[kpData.length - 1]) < 5 ? 'Unsettled' : 'Active'}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default DataVisualization;
