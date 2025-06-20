
import React from 'react';
import { AlertTriangle, Radio, Zap, Shield, RefreshCw } from 'lucide-react';
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

  const getAlertClass = (severity: string, active: boolean) => {
    if (!active) return 'data-card opacity-60';
    
    switch (severity) {
      case 'critical':
        return 'alert-critical';
      case 'moderate':
        return 'alert-moderate';
      case 'minor':
        return 'alert-minor';
      default:
        return 'data-card';
    }
  };

  const activeAlerts = alerts.filter(alert => alert.active);

  if (errors.alerts) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">Space Weather Alerts</h2>
          <button 
            onClick={refresh}
            className="flex items-center space-x-2 px-3 py-1 rounded-full bg-space-700/50 hover:bg-space-600/50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm">Retry</span>
          </button>
        </div>
        
        <Card className="data-card p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-solar-orange mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-solar-orange mb-2">Alert System Unavailable</h3>
          <p className="text-muted-foreground">
            Unable to fetch real-time alerts from NOAA Space Weather Prediction Center.
            Please check your connection and try again.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Space Weather Alerts</h2>
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-space-700/50">
              <RefreshCw className="w-2 h-2 animate-spin" />
              <span className="text-sm font-mono">UPDATING...</span>
            </div>
          ) : (
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              activeAlerts.length > 0 ? 'bg-solar-red/20 border border-solar-red/30' : 'bg-aurora-green/20 border border-aurora-green/30'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                activeAlerts.length > 0 ? 'bg-solar-red' : 'bg-aurora-green'
              }`} />
              <span className={`text-sm font-mono ${
                activeAlerts.length > 0 ? 'text-solar-red' : 'text-aurora-green'
              }`}>
                {activeAlerts.length > 0 ? `${activeAlerts.length} ACTIVE` : 'ALL CLEAR'}
              </span>
            </div>
          )}
        </div>
      </div>

      {activeAlerts.length === 0 ? (
        <Card className="data-card p-6 text-center">
          <div className="w-16 h-16 bg-aurora-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-aurora-green" />
          </div>
          <h3 className="text-lg font-semibold text-aurora-green mb-2">No Active Alerts</h3>
          <p className="text-muted-foreground">
            Space weather conditions are currently quiet. Continue monitoring for updates.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            
            return (
              <Card key={alert.id} className={`${getAlertClass(alert.severity, alert.active)} p-4`}>
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${
                    alert.severity === 'critical' ? 'bg-solar-red/20' :
                    alert.severity === 'moderate' ? 'bg-solar-orange/20' :
                    'bg-solar-yellow/20'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      alert.severity === 'critical' ? 'text-solar-red' :
                      alert.severity === 'moderate' ? 'text-solar-orange' :
                      'text-solar-yellow'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semib old text-foreground">{alert.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                        {alert.active && (
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alert.severity === 'critical' ? 'bg-solar-red/20 text-solar-red' :
                            alert.severity === 'moderate' ? 'bg-solar-orange/20 text-solar-orange' :
                            'bg-solar-yellow/20 text-solar-yellow'
                          }`}>
                            {alert.severity.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {alert.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Alert Legend */}
      <Card className="data-card p-4">
        <h3 className="font-semibold mb-3 text-foreground">Alert Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-solar-red rounded-full" />
            <span className="text-muted-foreground">Critical - Immediate action may be required</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-solar-orange rounded-full" />
            <span className="text-muted-foreground">Moderate - Monitor conditions closely</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-solar-yellow rounded-full" />
            <span className="text-muted-foreground">Minor - Minimal impact expected</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AlertPanel;
