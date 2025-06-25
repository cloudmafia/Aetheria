import React from 'react';
import Zap from 'lucide-react/dist/esm/icons/zap';
import Radio from 'lucide-react/dist/esm/icons/radio';
import Globe from 'lucide-react/dist/esm/icons/globe';
import Sun from 'lucide-react/dist/esm/icons/sun';
import Eye from 'lucide-react/dist/esm/icons/eye';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import X from 'lucide-react/dist/esm/icons/x';
import { useState, useEffect } from 'react';
import { useSpaceWeatherData } from '../hooks/useSpaceWeatherData';

interface SpaceWeatherEvent {
  id: string;
  type: 'flare' | 'cme' | 'geomagnetic' | 'radiation' | 'radio' | 'aurora';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  details?: string;
  location?: string;
}

const RealTimeEventFeed = () => {
  const { solarFlares, kpIndex, alerts, currentFlux, isLoading } = useSpaceWeatherData();
  const [events, setEvents] = useState<SpaceWeatherEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SpaceWeatherEvent | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const newEvents: SpaceWeatherEvent[] = [];

    // Process solar flares
    solarFlares.slice(0, 3).forEach((flare, index) => {
      // Properly categorize flares by class
      let severity;
      if (flare.classType.startsWith('X')) {
        severity = 'critical'; // X-class: Red
      } else if (flare.classType.startsWith('M')) {
        severity = 'major';    // M-class: Amber
      } else if (flare.classType.startsWith('C')) {
        severity = 'moderate'; // C-class: Green
      } else {
        severity = 'minor';    // B/A-class: Grey
      }
      
      newEvents.push({
        id: `flare-${index}`,
        type: 'flare',
        severity,
        title: `${flare.classType} Solar Flare`,
        description: `Peak at ${new Date(flare.peakTime).toLocaleTimeString()} UTC`,
        timestamp: new Date(flare.peakTime),
        details: `Active Region: ${flare.activeRegion || 'Unknown'}\nLocation: ${flare.sourceLocation || 'Unknown'}\nDuration: ${Math.round((new Date(flare.endTime).getTime() - new Date(flare.beginTime).getTime()) / 60000)} minutes`,
        location: flare.sourceLocation
      });
    });

    // Process geomagnetic activity
    if (kpIndex && kpIndex.kpIndex >= 3) {
      const severity = kpIndex.kpIndex >= 7 ? 'critical' : kpIndex.kpIndex >= 5 ? 'major' : 'moderate';
      newEvents.push({
        id: 'geomagnetic-current',
        type: 'geomagnetic',
        severity,
        title: `${kpIndex.stormLevel} Geomagnetic Conditions`,
        description: `Kp Index: ${kpIndex.kpIndex.toFixed(1)}`,
        timestamp: new Date(kpIndex.timestamp),
        details: `Current geomagnetic activity level indicates ${kpIndex.stormLevel.toLowerCase()} conditions. ${
          kpIndex.kpIndex >= 5 ? 'Aurora may be visible at lower latitudes.' : 
          kpIndex.kpIndex >= 3 ? 'Minor geomagnetic disturbances possible.' : ''
        }`
      });
    }

    // Process alerts
    alerts.slice(0, 2).forEach((alert, index) => {
      newEvents.push({
        id: `alert-${index}`,
        type: alert.type as any,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        timestamp: new Date(alert.timestamp),
        details: alert.description
      });
    });

    // Sort by timestamp (most recent first)
    newEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setEvents(newEvents.slice(0, 10)); // Keep only latest 10 events
  }, [solarFlares, kpIndex, alerts]);

  const getEventIcon = (type: string, severity: string) => {
    const iconClass = severity === 'critical' ? 'text-solar-red' :
                     severity === 'major' ? 'text-solar-orange' :
                     severity === 'moderate' ? 'text-solar-yellow' : 'text-aurora-green';

    // Special styling for flare classes
    let iconWrapper = '';
    if (type === 'flare') {
      if (severity === 'critical') {
        // X-class flares get glowing red effect
        iconWrapper = 'relative after:absolute after:inset-0 after:bg-solar-red/30 after:blur-md after:animate-pulse after:rounded-full';
      } else if (severity === 'major') {
        // M-class flares get amber effect
        iconWrapper = 'relative after:absolute after:inset-0 after:bg-solar-orange/20 after:blur-sm after:rounded-full';
      } else {
        // C-class get light green
        iconWrapper = 'relative after:absolute after:inset-0 after:bg-aurora-green/20 after:blur-sm after:rounded-full';
      }
    }

    switch (type) {
      case 'flare': return <div className={iconWrapper}><Zap className={`h-4 w-4 ${iconClass} relative z-10`} /></div>;
      case 'cme': return <Sun className={`h-4 w-4 ${iconClass}`} />;
      case 'geomagnetic': return <Globe className={`h-4 w-4 ${iconClass}`} />;
      case 'radiation': return <Radio className={`h-4 w-4 ${iconClass}`} />;
      case 'aurora': return <Eye className={`h-4 w-4 ${iconClass}`} />;
      default: return <Radio className={`h-4 w-4 ${iconClass}`} />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      return timestamp.toLocaleDateString();
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <>
      <div className={`aetheria-glass transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-80'}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            {!isCollapsed && (
              <div>
                <h3 className="font-display font-semibold cosmic-glow">Live Event Feed</h3>
                <p className="text-xs text-muted-foreground">Real-time space weather updates</p>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>

          {!isCollapsed && (
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-cosmic-blue border-t-transparent" />
                </div>
              ) : events.length > 0 ? (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="aetheria-glass p-3 cursor-pointer hover:bg-white/10 transition-all duration-200"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getEventIcon(event.type, event.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">
                          {event.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {event.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(event.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Radio className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent events</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
          <div className="aetheria-glass max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getEventIcon(selectedEvent.type, selectedEvent.severity)}
                  <h4 className="text-lg font-semibold">{selectedEvent.title}</h4>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Event Details</h5>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.details || selectedEvent.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Timestamp:</span>
                    <div className="font-mono">{selectedEvent.timestamp.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Severity:</span>
                    <div className={`font-medium capitalize ${
                      selectedEvent.severity === 'critical' ? 'text-solar-red' :
                      selectedEvent.severity === 'major' ? 'text-solar-orange' :
                      selectedEvent.severity === 'moderate' ? 'text-solar-yellow' : 'text-aurora-green'
                    }`}>
                      {selectedEvent.severity}
                    </div>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div>
                    <span className="text-muted-foreground text-sm">Location:</span>
                    <div className="font-mono text-sm">{selectedEvent.location}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RealTimeEventFeed;
