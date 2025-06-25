import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, AlertCircle, RefreshCw, Server } from 'lucide-react';

// Define the API endpoint structure
interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  description: string;
  category: 'space-weather' | 'satellite' | 'imagery';
  status: 'up' | 'down' | 'degraded' | 'unknown';
  responseCode?: number;
  responseTime?: number;
  lastChecked: Date;
}

const ApiStatusWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    {
      id: 'solar-flares',
      name: 'Solar Flares',
      url: 'https://services.swpc.noaa.gov/json/goes/xray-flares-7-day.json',
      description: 'NOAA GOES X-ray Flare data',
      category: 'space-weather',
      status: 'unknown',
      lastChecked: new Date()
    },
    {
      id: 'xray-flux',
      name: 'X-ray Flux',
      url: 'https://services.swpc.noaa.gov/json/goes/primary-xrays-1-day.json',
      description: 'NOAA GOES X-ray Flux measurements',
      category: 'space-weather',
      status: 'unknown',
      lastChecked: new Date()
    },
    {
      id: 'kp-index',
      name: 'Kp Index',
      url: 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json',
      description: 'Geomagnetic Kp index data',
      category: 'space-weather',
      status: 'unknown',
      lastChecked: new Date()
    },
    {
      id: 'solar-wind',
      name: 'Solar Wind',
      url: 'https://services.swpc.noaa.gov/json/ace/swepam_1m.json',
      description: 'ACE Solar Wind measurements',
      category: 'space-weather',
      status: 'unknown',
      lastChecked: new Date()
    },
    {
      id: 'alerts',
      name: 'Space Weather Alerts',
      url: 'https://services.swpc.noaa.gov/json/alerts.json',
      description: 'NOAA Space Weather Alerts',
      category: 'space-weather',
      status: 'unknown',
      lastChecked: new Date()
    },
    {
      id: 'sdo-imagery',
      name: 'SDO Imagery',
      url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0171.jpg',
      description: 'NASA Solar Dynamics Observatory images',
      category: 'imagery',
      status: 'unknown',
      lastChecked: new Date()
    },
    {
      id: 'satellite-tle',
      name: 'Satellite TLE Data',
      url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle',
      description: 'Satellite orbital elements',
      category: 'satellite',
      status: 'unknown',
      lastChecked: new Date()
    }
  ]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Calculate overall status
  const getOverallStatus = (): 'up' | 'degraded' | 'down' => {
    const downCount = endpoints.filter(e => e.status === 'down').length;
    const degradedCount = endpoints.filter(e => e.status === 'degraded').length;
    
    if (downCount > 2) return 'down';
    if (downCount > 0 || degradedCount > 0) return 'degraded';
    return 'up';
  };

  // Check all API endpoints
  const checkApiStatus = async () => {
    setIsChecking(true);
    
    const updatedEndpoints = [...endpoints];
    
    for (let i = 0; i < updatedEndpoints.length; i++) {
      const endpoint = updatedEndpoints[i];
      try {
        const startTime = Date.now();
        
        // Use a CORS proxy for testing endpoints
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(endpoint.url)}`;
        
        const response = await fetch(proxyUrl, { 
          method: 'HEAD',
          mode: 'cors',
          cache: 'no-cache'
        });
        
        const responseTime = Date.now() - startTime;
        
        updatedEndpoints[i] = {
          ...endpoint,
          status: response.ok ? 'up' : 'degraded',
          responseCode: response.status,
          responseTime,
          lastChecked: new Date()
        };
      } catch (error) {
        console.error(`Error checking ${endpoint.name}:`, error);
        updatedEndpoints[i] = {
          ...endpoint,
          status: 'down',
          lastChecked: new Date()
        };
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setEndpoints(updatedEndpoints);
    setLastUpdate(new Date());
    setIsChecking(false);
  };

  // Initial check on component mount
  useEffect(() => {
    checkApiStatus();
    
    // Check status every 5 minutes
    const interval = setInterval(checkApiStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Status colors
  const statusColors = {
    up: 'bg-aurora-green',
    degraded: 'bg-solar-orange',
    down: 'bg-solar-red',
    unknown: 'bg-gray-400'
  };

  // Status icons
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'up':
        return <CheckCircle className="h-4 w-4 text-aurora-green" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-solar-orange" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-solar-red" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Floating status button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`aetheria-glass p-3 rounded-full shadow-lg flex items-center justify-center relative group transition-all duration-300 hover:scale-110 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <Server className="h-5 w-5 text-white" />
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${statusColors[overallStatus]} animate-pulse`} />
        
        {/* Status glow */}
        <div className={`absolute inset-0 rounded-full ${
          overallStatus === 'up' ? 'bg-aurora-green/20' :
          overallStatus === 'degraded' ? 'bg-solar-orange/20' : 'bg-solar-red/20'
        } filter blur-md -z-10 animate-pulse`} 
        style={{ animationDuration: '3s' }} />
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black/80 backdrop-blur-sm rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <p className="font-semibold text-white">API Status: {
            overallStatus === 'up' ? 'All Systems Operational' :
            overallStatus === 'degraded' ? 'Partial Outage' : 'Major Outage'
          }</p>
          <p className="text-white/70 text-[10px] mt-1">Click for detailed status</p>
        </div>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setIsOpen(false)}>
          <div className="aetheria-glass max-w-2xl w-full max-h-[80vh] overflow-hidden rounded-xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${statusColors[overallStatus]} animate-pulse`} />
                <h3 className="text-xl font-display font-bold cosmic-glow">API Status</h3>
              </div>
              
              <div className="flex items-center space-x-4">
                {lastUpdate && (
                  <span className="text-sm text-muted-foreground">
                    Updated: {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    checkApiStatus();
                  }}
                  className="aetheria-button flex items-center space-x-2"
                  disabled={isChecking}
                >
                  <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {/* Status summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="aetheria-glass p-3 text-center">
                  <div className="text-2xl font-bold text-aurora-green">
                    {endpoints.filter(e => e.status === 'up').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Operational</div>
                </div>
                <div className="aetheria-glass p-3 text-center">
                  <div className="text-2xl font-bold text-solar-orange">
                    {endpoints.filter(e => e.status === 'degraded').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Degraded</div>
                </div>
                <div className="aetheria-glass p-3 text-center">
                  <div className="text-2xl font-bold text-solar-red">
                    {endpoints.filter(e => e.status === 'down').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Down</div>
                </div>
              </div>
              
              {/* API list */}
              <div className="space-y-3">
                {endpoints.map(endpoint => (
                  <div key={endpoint.id} className="aetheria-glass p-3 flex items-center space-x-3">
                    <StatusIcon status={endpoint.status} />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{endpoint.name}</h4>
                        <div className={`text-xs font-mono px-2 py-0.5 rounded ${
                          endpoint.status === 'up' ? 'bg-aurora-green/20 text-aurora-green' :
                          endpoint.status === 'degraded' ? 'bg-solar-orange/20 text-solar-orange' :
                          endpoint.status === 'down' ? 'bg-solar-red/20 text-solar-red' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {endpoint.responseCode || '—'}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">{endpoint.description}</div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs text-muted-foreground">
                          {endpoint.category === 'space-weather' && '☀️ Space Weather'}
                          {endpoint.category === 'imagery' && '🔭 Imagery'}
                          {endpoint.category === 'satellite' && '🛰️ Satellite Data'}
                        </div>
                        {endpoint.responseTime && (
                          <div className="text-xs text-muted-foreground">
                            {endpoint.responseTime}ms
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-white/10 text-xs text-center text-muted-foreground">
              Data refreshes automatically every 5 minutes. Last checked: {lastUpdate?.toLocaleString() || 'Never'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiStatusWidget;
