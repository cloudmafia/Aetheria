
import React from 'react';
import { AlertTriangle, Radio, Zap, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Alert {
  id: string;
  type: 'solar-flare' | 'geomagnetic-storm' | 'radio-blackout' | 'radiation-storm';
  severity: 'minor' | 'moderate' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  active: boolean;
}

const AlertPanel = () => {
  const alerts: Alert[] = [
    {
      id: '1',
      type: 'solar-flare',
      severity: 'moderate',
      title: 'M2.5 Solar Flare Detected',
      description: 'Minor radio blackouts expected on sunlit side of Earth',
      timestamp: '14:32 UTC',
      active: true
    },
    {
      id: '2',
      type: 'geomagnetic-storm',
      severity: 'critical',
      title: 'G3 Geomagnetic Storm Warning',
      description: 'Strong geomagnetic storm conditions possible in next 24-48 hours',
      timestamp: '12:15 UTC',
      active: true
    },
    {
      id: '3',
      type: 'radio-blackout',
      severity: 'minor',
      title: 'R1 Radio Blackout',
      description: 'Minor degradation of HF radio communication',
      timestamp: '11:45 UTC',
      active: false
    }
  ];

  const getAlertIcon = (type: Alert['type']) => {
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

  const getAlertClass = (severity: Alert['severity'], active: boolean) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Active Alerts</h2>
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-solar-red/20 border border-solar-red/30">
          <div className="w-2 h-2 bg-solar-red rounded-full animate-pulse" />
          <span className="text-sm font-mono text-solar-red">
            {alerts.filter(a => a.active).length} ACTIVE
          </span>
        </div>
      </div>

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
                    <h3 className="font-semibold text-foreground">{alert.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        {alert.timestamp}
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
