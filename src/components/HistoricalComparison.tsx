
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Clock, TrendingUp, Calendar, BookOpen } from 'lucide-react';

interface HistoricalEvent {
  name: string;
  date: string;
  description: string;
  maxValue: number;
  type: 'flare' | 'storm' | 'radiation';
}

interface ComparisonData {
  time: string;
  current: number;
  historical?: number;
}

const HistoricalComparison = () => {
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [dataType, setDataType] = useState<'xray' | 'kp' | 'proton'>('xray');

  const famousEvents: HistoricalEvent[] = [
    {
      name: 'Carrington Event',
      date: '1859-09-01',
      description: 'The most powerful geomagnetic storm in recorded history',
      maxValue: 9.0,
      type: 'storm'
    },
    {
      name: 'March 1989 Storm',
      date: '1989-03-13',
      description: 'Caused the Quebec blackout, affecting 6 million people',
      maxValue: 8.5,
      type: 'storm'
    },
    {
      name: 'Halloween Storms',
      date: '2003-10-28',
      description: 'Series of X-class flares and severe geomagnetic storms',
      maxValue: 8.7,
      type: 'storm'
    },
    {
      name: 'Bastille Day Event',
      date: '2000-07-14',
      description: 'X5.7 solar flare followed by major geomagnetic storm',
      maxValue: 8.2,
      type: 'flare'
    }
  ];

  useEffect(() => {
    // Generate current data and historical comparison
    const generateComparisonData = () => {
      const data: ComparisonData[] = [];
      const now = new Date();
      
      for (let i = 47; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 30 * 60 * 1000); // 30-minute intervals
        const currentValue = Math.random() * 5 + 1; // Simulate current readings
        
        data.push({
          time: time.toISOString(),
          current: currentValue,
          historical: selectedEvent ? Math.random() * selectedEvent.maxValue : undefined
        });
      }
      return data;
    };

    setComparisonData(generateComparisonData());
  }, [selectedEvent, dataType]);

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getDataTypeInfo = () => {
    switch (dataType) {
      case 'xray':
        return { label: 'X-ray Flux', unit: 'W/m²', color: '#ef4444' };
      case 'kp':
        return { label: 'Kp Index', unit: '', color: '#8b5cf6' };
      case 'proton':
        return { label: 'Proton Flux', unit: 'pfu', color: '#3b82f6' };
    }
  };

  const dataInfo = getDataTypeInfo();

  return (
    <div className="aetheria-glass p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="h-5 w-5 text-cosmic-purple" />
        <h3 className="text-lg font-display font-semibold cosmic-glow">
          Historical Event Comparison
        </h3>
      </div>

      <div className="space-y-6">
        {/* Data Type Selection */}
        <div className="flex space-x-2">
          {[
            { key: 'xray', label: 'X-ray Flux' },
            { key: 'kp', label: 'Kp Index' },
            { key: 'proton', label: 'Proton Flux' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDataType(key as any)}
              className={`aetheria-glass px-4 py-2 text-sm transition-all duration-200 hover:bg-white/10 ${
                dataType === key ? 'ring-2 ring-cosmic-blue' : ''
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Famous Events Grid */}
        <div className="grid grid-cols-2 gap-4">
          {famousEvents.map((event) => (
            <button
              key={event.name}
              onClick={() => setSelectedEvent(selectedEvent?.name === event.name ? null : event)}
              className={`aetheria-glass p-4 text-left transition-all duration-200 hover:bg-white/10 ${
                selectedEvent?.name === event.name ? 'ring-2 ring-cosmic-blue' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-3 h-3 rounded-full mt-1 ${
                  event.type === 'flare' ? 'bg-solar-red' :
                  event.type === 'storm' ? 'bg-cosmic-purple' : 'bg-cosmic-blue'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{event.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {event.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Comparison Chart */}
        <div className="aetheria-glass p-4">
          <div className="mb-4">
            <h4 className="font-semibold text-foreground">
              {dataInfo.label} Comparison
              {selectedEvent && ` vs ${selectedEvent.name}`}
            </h4>
            <p className="text-sm text-muted-foreground">
              Last 24 hours {dataInfo.unit && `• ${dataInfo.unit}`}
            </p>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData.map(d => ({
                time: formatTime(d.time),
                Current: d.current,
                Historical: d.historical
              }))}>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    backdropFilter: 'blur(16px)'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Current"
                  stroke={dataInfo.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: dataInfo.color }}
                />
                {selectedEvent && (
                  <Line
                    type="monotone"
                    dataKey="Historical"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 4, fill: '#94a3b8' }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Details */}
        {selectedEvent && (
          <div className="aetheria-glass p-4">
            <div className="flex items-center space-x-2 mb-3">
              <BookOpen className="h-4 w-4 text-aurora-green" />
              <h4 className="font-semibold">{selectedEvent.name}</h4>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <div className="font-mono">{new Date(selectedEvent.date).toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Peak Value:</span>
                  <div className="font-mono text-solar-orange">{selectedEvent.maxValue}</div>
                </div>
              </div>
              
              <div>
                <span className="text-muted-foreground text-sm">Description:</span>
                <p className="text-sm mt-1">{selectedEvent.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Solar Cycle Context */}
        <div className="aetheria-glass p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="h-4 w-4 text-cosmic-blue" />
            <h4 className="font-semibold">Solar Cycle Context</h4>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Current Cycle:</span>
              <div className="font-mono text-cosmic-blue">Cycle 25</div>
            </div>
            <div>
              <span className="text-muted-foreground">Phase:</span>
              <div className="font-mono text-aurora-green">Active</div>
            </div>
            <div>
              <span className="text-muted-foreground">Expected Peak:</span>
              <div className="font-mono text-solar-orange">2024-2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalComparison;
