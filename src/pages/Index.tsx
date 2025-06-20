
import React from 'react';
import Header from '../components/Header';
import SolarActivity from '../components/SolarActivity';
import AlertPanel from '../components/AlertPanel';
import DataVisualization from '../components/DataVisualization';
import SolarImageryGrid from '../components/SolarImageryGrid';
import RealTimeEventFeed from '../components/RealTimeEventFeed';
import CriticalAlertBanner from '../components/CriticalAlertBanner';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <CriticalAlertBanner />
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-12">
        {/* Enhanced Layout with Event Feed */}
        <div className="flex gap-8">
          {/* Main Content Area */}
          <div className="flex-1 space-y-12">
            {/* Hero Section with Solar Activity */}
            <section className="animate-fade-in">
              <SolarActivity />
            </section>

            {/* Multi-Wavelength Solar Imagery */}
            <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <SolarImageryGrid />
            </section>

            {/* Alert Panel */}
            <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <AlertPanel />
            </section>

            {/* Data Visualization */}
            <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <DataVisualization />
            </section>
          </div>

          {/* Real-time Event Feed Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <RealTimeEventFeed />
            </div>
          </div>
        </div>

        {/* Mobile Event Feed */}
        <div className="lg:hidden">
          <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="aetheria-glass p-6">
              <h3 className="text-xl font-display font-semibold cosmic-glow mb-4">
                Recent Space Weather Events
              </h3>
              <div className="max-h-64 overflow-y-auto">
                <RealTimeEventFeed />
              </div>
            </div>
          </section>
        </div>

        {/* Additional Info Section */}
        <section className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="data-card p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">About Aetheria</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Aetheria represents the next evolution in space weather monitoring, 
                combining real-time data from NASA, NOAA, and ESA with cutting-edge 
                visualization technology to provide unparalleled insights into our 
                dynamic space environment.
              </p>
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Multi-Wavelength Imaging</h4>
                  <p className="text-muted-foreground">Live SDO imagery across six key wavelengths</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Real-Time Alerts</h4>
                  <p className="text-muted-foreground">Instant notifications for critical space weather events</p>
                </div>
              </div>
            </div>

            <div className="data-card p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">Current Solar Cycle</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Solar Cycle</span>
                  <span className="font-mono text-foreground">Cycle 25 - Active Phase</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Peak Expected</span>
                  <span className="font-mono text-foreground">2024-2026</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Current Activity</span>
                  <span className="font-mono text-aurora-green">High</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Data Sources</span>
                  <span className="font-mono text-cosmic-blue">NASA • NOAA • ESA</span>
                </div>
              </div>
            </div>

            <div className="data-card p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">Impact Monitoring</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Radio Communications</span>
                  <span className="font-mono text-aurora-green">Normal</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Satellite Operations</span>
                  <span className="font-mono text-aurora-green">Normal</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Navigation (GPS)</span>
                  <span className="font-mono text-aurora-green">Normal</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Power Systems</span>
                  <span className="font-mono text-aurora-green">Normal</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="aetheria-glass border-t border-border/50 px-6 py-8 mt-12">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            Aetheria - Advanced Space Weather Observatory
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            Real-time data from NASA SDO • NOAA SWPC • ESA • Multi-wavelength solar imaging • Critical event alerting
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
