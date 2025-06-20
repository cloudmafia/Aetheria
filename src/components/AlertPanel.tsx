
import React from 'react';
import { AlertTriangle, Radio, Zap, Shield, RefreshCw, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useSpaceWeatherData } from '../hooks/useSpaceWeatherData';

const AlertPanel = () => {
  const { alerts, isLoading, errors, refresh } = useSpaceWeatherData();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'solar-flare':
        return Zap;
      case 'geomagnetic-storm':
        return AlertTriangle;
      case 'radio-blackout':
        return Radio;
      case 'radiation-storm':
        return Shield;
      default:
        return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-solar-red';
      case 'moderate':
        return 'text-solar-orange';
      case 'minor':
        return 'text-solar-yellow';
      default:
        return 'text-muted-foreground';
    }
  };

  const getSeverityGlow = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'shadow-red-500/20';
      case 'moderate':
        return 'shadow-orange-500/20';
      case 'minor':
        return 'shadow-yellow-500/20';
      default:
        return '';
    }
  };

  const activeAlerts = alerts.filter(alert => alert.active);

  if (errors.alerts) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold cosmic-glow">Alert Network</h2>
          <button 
            onClick={refresh}
            className="aetheria-button flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reconnect</span>
          </button>
        </div>
        
        <div className="aetheria-glass p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-solar-orange/20 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-solar-orange animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-solar-orange mb-2">Alert Network Offline</h3>
          <p className="text-muted-foreground mb-4">
            Unable to establish connection to NOAA Space Weather Prediction Center alert systems.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Attempting reconnection...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold cosmic-glow">Alert Network</h2>
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="aetheria-glass px-4 py-2 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cosmic-blue" />
              <span className="text-sm font-mono text-cosmic-blue">SCANNING...</span>
            </div>
          ) : (
            <div className={`aetheria-glass px-4 py-2 flex items-center space-x-3 ${
              activeAlerts.length > 0 ? 'pulse-glow border-solar-orange/30' : 'border-aurora-green/30'
            }`}>
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                activeAlerts.length > 0 ? 'bg-solar-orange' : 'bg-aurora-green'
              }`} />
              <div className="text-right">
                <div className={`text-sm font-mono font-semibold ${
                  activeAlerts.length > 0 ? 'text-solar-orange' : 'text-aurora-green'
                }`}>
                  {activeAlerts.length > 0 ? `${activeAlerts.length} ACTIVE` : 'ALL CLEAR'}
                </div>
                <div className="text-xs text-muted-foreground">THREAT STATUS</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeAlerts.length === 0 ? (
        <div className="aetheria-glass p-8 text-center">
          <div className="w-20 h-20 bg-aurora-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-aurora-green" />
            <div className="absolute w-20 h-20 border-2 border-aurora-green/30 rounded-full animate-ping" />
          </div>
          <h3 className="text-xl font-semibold text-aurora-green mb-3 cosmic-glow">Perimeter Secure</h3>
          <p className="text-muted-foreground text-lg mb-4">
            All space weather systems operating within normal parameters
          </p>
          <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
            <div className="text-center">
              <div className="text-aurora-green font-mono font-bold">G0</div>
              <div className="text-muted-foreground">Geomagnetic</div>
            </div>
            <div className="text-center">
              <div className="text-aurora-green font-mono font-bold">R0</div>
              <div className="text-muted-foreground">Radio</div>
            </div>
            <div className="text-center">
              <div className="text-aurora-green font-mono font-bold">S0</div>
              <div className="text-muted-foreground">Radiation</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            const severityColor = getSeverityColor(alert.severity);
            const severityGlow = getSeverityGlow(alert.severity);
            
            return (
              <div key={alert.id} className={`aetheria-glass p-6 ${alert.severity} ${severityGlow}`}>
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${
                    alert.severity === 'critical' ? 'bg-solar-red/20 border border-solar-red/30' :
                    alert.severity === 'moderate' ? 'bg-solar-orange/20 border border-solar-orange/30' :
                    'bg-solar-yellow/20 border border-solar-yellow/30'
                  } aetheria-glass`}>
                    <Icon className={`h-6 w-6 ${severityColor}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg mb-1">{alert.title}</h3>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            alert.severity === 'critical' ? 'bg-solar-red/20 text-solar-red border border-solar-red/30' :
                            alert.severity === 'moderate' ? 'bg-solar-orange/20 text-solar-orange border border-solar-orange/30' :
                            'bg-solar-yellow/20 text-solar-yellow border border-solar-yellow/30'
                          } aetheria-glass`}>
                            {alert.severity}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      {alert.active && alert.severity === 'critical' && (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-solar-red rounded-full animate-ping" />
                          <span className="text-xs font-mono text-solar-red font-bold">ACTIVE</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {alert.description}
                    </p>
                    
                    {alert.severity === 'critical' && (
                      <div className="mt-4 p-3 bg-solar-red/10 border border-solar-red/20 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-solar-red" />
                          <span className="text-sm font-semibold text-solar-red">Critical Impact Advisory</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Immediate action may be required. Monitor conditions closely and implement protective measures as necessary.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alert Classification Legend */}
      <div className="aetheria-glass p-6">
        <h3 className="font-semibold mb-4 text-foreground text-lg">Threat Classification Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-solar-red/5 border border-solar-red/20">
            <div className="w-4 h-4 bg-solar-red rounded-full flex-shrink-0" />
            <div>
              <div className="font-semibold text-solar-red text-sm">CRITICAL</div>
              <div className="text-xs text-muted-foreground">Immediate response required</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-solar-orange/5 border border-solar-orange/20">
            <div className="w-4 h-4 bg-solar-orange rounded-full flex-shrink-0" />
            <div>
              <div className="font-semibold text-solar-orange text-sm">MODERATE</div>
              <div className="text-xs text-muted-foreground">Enhanced monitoring advised</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-solar-yellow/5 border border-solar-yellow/20">
            <div className="w-4 h-4 bg-solar-yellow rounded-full flex-shrink-0" />
            <div>
              <div className="font-semibold text-solar-yellow text-sm">MINOR</div>
              <div className="text-xs text-muted-foreground">Minimal impact expected</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertPanel;
