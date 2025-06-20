
import React from 'react';
import Header from '../components/Header';
import SolarActivity from '../components/SolarActivity';
import AlertPanel from '../components/AlertPanel';
import DataVisualization from '../components/DataVisualization';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-12">
        {/* Hero Section with Solar Activity */}
        <section className="animate-fade-in">
          <SolarActivity />
        </section>

        {/* Alert Panel */}
        <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <AlertPanel />
        </section>

        {/* Data Visualization */}
        <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <DataVisualization />
        </section>

        {/* Additional Info Section */}
        <section className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="data-card p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">About Space Weather</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Space weather refers to the environmental conditions in Earth's magnetosphere, 
                ionosphere, and thermosphere due to the Sun and the solar wind that can 
                influence the performance and reliability of space-borne and ground-based 
                technological systems.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Solar Flares</h4>
                  <p className="text-muted-foreground">Sudden releases of electromagnetic energy</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">CMEs</h4>
                  <p className="text-muted-foreground">Coronal mass ejections affecting Earth</p>
                </div>
              </div>
            </div>

            <div className="data-card p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">Current Conditions</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Solar Cycle</span>
                  <span className="font-mono text-foreground">Cycle 25 - Rising</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Sunspot Number</span>
                  <span className="font-mono text-foreground">123 ± 12</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Solar Flux Index</span>
                  <span className="font-mono text-foreground">145.2 sfu</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Last Update</span>
                  <span className="font-mono text-aurora-green">Live</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-border/50 px-6 py-8 mt-12">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            SolarWatch - Real-time space weather monitoring system
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            Data sourced from NOAA Space Weather Prediction Center, NASA, and ESA
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
