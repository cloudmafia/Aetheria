
import React from 'react';
import { Sun, AlertTriangle } from 'lucide-react';

const Header = () => {
  return (
    <header className="glass-panel border-b border-border/50 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Sun className="h-8 w-8 text-solar-yellow animate-spin-slow" />
            <div className="absolute inset-0 h-8 w-8 text-solar-yellow animate-pulse-soft opacity-30">
              <Sun />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary glow-text">SolarWatch</h1>
            <p className="text-sm text-muted-foreground">Space Weather Observatory</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-space-700/50">
            <div className="w-2 h-2 bg-aurora-green rounded-full animate-pulse" />
            <span className="text-sm font-mono text-aurora-green">SYSTEMS ONLINE</span>
          </div>
          
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-solar-orange/20 border border-solar-orange/30">
            <AlertTriangle className="h-4 w-4 text-solar-orange" />
            <span className="text-sm font-mono text-solar-orange">2 ACTIVE ALERTS</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
