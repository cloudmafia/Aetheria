
import React from 'react';
import Header from '../components/Header';
import SolarActivity from '../components/SolarActivity';
import AlertPanel from '../components/AlertPanel';
import DataVisualization from '../components/DataVisualization';
import SolarExplorer from '../components/SolarExplorer';
import RealTimeEventFeed from '../components/RealTimeEventFeed';
import CriticalAlertBanner from '../components/CriticalAlertBanner';
import SatelliteTracker from '../components/SatelliteTracker';
import GeomagneticField from '../components/GeomagneticField';
import AuroraForecastMap from '../components/AuroraForecastMap';
import RadioFluxDashboard from '../components/RadioFluxDashboard';
import HistoricalComparison from '../components/HistoricalComparison';
import HistoricalTimeline from '../components/HistoricalTimeline';
import PersonalizedImpact from '../components/PersonalizedImpact';
import ApiStatusWidget from '../components/ApiStatusWidget';
import LatestSpaceWeatherNews from '../components/LatestSpaceWeatherNews';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <CriticalAlertBanner />
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Enhanced Layout with Main Content */}
        <div className="flex gap-4">
          {/* Main Content Area */}
          <div className="flex-1 space-y-4">
            {/* Hero Section with Systems Status and Key Components */}
            <section className="animate-fade-in">
              <div className="grid grid-cols-1 gap-4">
                <SolarActivity />
              </div>
            </section>

            {/* Priority Components - Now at Top */}
            <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <HistoricalComparison />
                <AlertPanel />
              </div>
            </section>
            
            {/* Enhanced Features Grid - Moved Up */}
            <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SatelliteTracker />
                <GeomagneticField />
                <AuroraForecastMap />
              </div>
            </section>
            
            {/* Live Event Feed & Latest News */}
            <section className="animate-fade-in" style={{ animationDelay: '0.23s' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2"><RealTimeEventFeed /></div>
                <LatestSpaceWeatherNews />
              </div>
            </section>
            
            {/* Historical Timeline */}
            <section className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
              <HistoricalTimeline />
            </section>

            {/* Multi-Wavelength Solar Explorer */}
            <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <SolarExplorer />
            </section>

            {/* Data Visualization */}
            <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <DataVisualization />
            </section>

            {/* Radio Flux Dashboard */}
            <section className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <RadioFluxDashboard />
            </section>

            {/* Personalized Impact */}
            <section className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <PersonalizedImpact />
            </section>
          </div>

          {/* Sidebar removed as event feed moved to top */}
        </div>

        {/* Mobile Event Feed removed as it's now at the top of the page for all screen sizes */}

        {/* Additional Info Section */}
        <section className="animate-fade-in" style={{ animationDelay: '0.9s' }}>
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
                  <h4 className="font-semibold text-foreground mb-2">Real-Time Tracking</h4>
                  <p className="text-muted-foreground">Satellite positions and orbital mechanics</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">3D Visualizations</h4>
                  <p className="text-muted-foreground">Interactive Earth models and field lines</p>
                </div>
              </div>
            </div>

            <div className="data-card p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">Enhanced Features</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Satellite Tracking</span>
                  <span className="font-mono text-aurora-green">Real-time</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Historical Analysis</span>
                  <span className="font-mono text-cosmic-blue">165+ Years</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Personal Impact</span>
                  <span className="font-mono text-cosmic-purple">Location-based</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Educational</span>
                  <span className="font-mono text-solar-orange">Interactive</span>
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
            Real-time data from NASA SDO • NOAA SWPC • ESA • Celestrak TLEs • Interactive 3D models • Historical analysis • Personalized impact assessment
          </p>
        </div>
      </footer>
      
      {/* API Status Widget */}
      <ApiStatusWidget />
    </div>
  );
};

export default Index;
