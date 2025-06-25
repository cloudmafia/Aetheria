
import React, { useState, useEffect } from 'react';
import { MapPin, Wifi, Navigation, Zap, Eye, BookOpen, X } from 'lucide-react';
import { useSpaceWeatherData } from '../hooks/useSpaceWeatherData';

interface GlossaryTerm {
  term: string;
  definition: string;
  explanation: string;
  relatedTerms: string[];
}

interface LocationImpact {
  location: string;
  latitude: number;
  aurora: 'impossible' | 'extremely-rare' | 'possible' | 'likely';
  hfRadio: 'good' | 'fair' | 'poor';
  gps: 'normal' | 'degraded' | 'poor';
}

const PersonalizedImpact = () => {
  const [userLocation, setUserLocation] = useState<LocationImpact | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);
  const [showCMEJourney, setShowCMEJourney] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [animationPlaying, setAnimationPlaying] = useState(false);
  const { kpIndex, currentFlux, alerts } = useSpaceWeatherData();

  const glossaryTerms: GlossaryTerm[] = [
    {
      term: 'Kp Index',
      definition: 'A global geomagnetic activity index ranging from 0-9',
      explanation: 'The Kp index measures disturbances in Earth\'s magnetic field caused by solar wind interactions. Higher values indicate stronger geomagnetic storms.',
      relatedTerms: ['Geomagnetic Storm', 'Aurora', 'Solar Wind']
    },
    {
      term: 'Bz Component',
      definition: 'The north-south component of the interplanetary magnetic field',
      explanation: 'When Bz points southward (negative values), it can more easily connect with Earth\'s magnetic field, potentially causing geomagnetic disturbances.',
      relatedTerms: ['Solar Wind', 'Geomagnetic Storm', 'Reconnection']
    },
    {
      term: 'X-ray Flux',
      definition: 'Solar X-ray emissions measured by GOES satellites',
      explanation: 'Solar flares produce intense X-ray radiation. The flux is measured in watts per square meter and classified into C, M, and X classes.',
      relatedTerms: ['Solar Flare', 'Radio Blackout', 'GOES']
    }
  ];

  useEffect(() => {
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude } = position.coords;
          
          // Determine location-based impacts
          let location = 'Unknown';
          let aurora: LocationImpact['aurora'] = 'impossible';
          
          if (latitude > 60) {
            location = 'High Latitude';
            aurora = 'likely';
          } else if (latitude > 50) {
            location = 'Mid-High Latitude';
            aurora = 'possible';
          } else if (latitude > 30) {
            location = 'Mid Latitude';
            aurora = 'extremely-rare';
          } else {
            location = 'Low Latitude';
            aurora = 'impossible';
          }
          
          setUserLocation({
            location,
            latitude,
            aurora,
            hfRadio: 'good',
            gps: 'normal'
          });
        },
        () => {
          // Default to Delhi coordinates if location denied
          setUserLocation({
            location: 'Delhi, India',
            latitude: 28.6,
            aurora: 'impossible',
            hfRadio: 'good',
            gps: 'normal'
          });
        }
      );
    }
  }, []);

  // Update impact assessments based on space weather
  useEffect(() => {
    if (!userLocation) return;

    const updated = { ...userLocation };

    // Update aurora visibility based on Kp index
    if (kpIndex) {
      if (kpIndex.kpIndex >= 8 && userLocation.latitude > 25) {
        updated.aurora = 'extremely-rare';
      } else if (kpIndex.kpIndex >= 6 && userLocation.latitude > 45) {
        updated.aurora = 'possible';
      } else if (kpIndex.kpIndex >= 4 && userLocation.latitude > 60) {
        updated.aurora = 'likely';
      }
    }

    // Update HF radio conditions based on X-ray flux
    if (currentFlux) {
      if (currentFlux.shortFlux >= 1e-4) {
        updated.hfRadio = 'poor';
      } else if (currentFlux.shortFlux >= 1e-5) {
        updated.hfRadio = 'fair';
      }
    }

    // Update GPS based on alerts
    if (alerts.some(alert => alert.type === 'radiation-storm' && alert.severity !== 'minor')) {
      updated.gps = 'degraded';
    }

    setUserLocation(updated);
  }, [kpIndex, currentFlux, alerts, userLocation?.latitude]);

  const getAuroraColor = (aurora: LocationImpact['aurora']) => {
    switch (aurora) {
      case 'likely': return 'text-aurora-green';
      case 'possible': return 'text-solar-yellow';
      case 'extremely-rare': return 'text-solar-orange';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'good' || status === 'normal' || status === 'likely') return 'text-aurora-green';
    if (status === 'fair' || status === 'degraded' || status === 'possible') return 'text-solar-yellow';
    return 'text-solar-red';
  };

  return (
    <div className="space-y-6">
      {/* Local Impact Card */}
      <div className="aetheria-glass p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="h-5 w-5 text-cosmic-blue" />
          <h3 className="text-lg font-display font-semibold cosmic-glow">
            My Local Impact
          </h3>
        </div>

        {userLocation ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Location: {userLocation.location} ({userLocation.latitude.toFixed(1)}°N)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="aetheria-glass p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Eye className="h-4 w-4 text-cosmic-purple" />
                  <span className="text-sm font-medium">Aurora Visibility</span>
                </div>
                <div className={`text-lg font-medium capitalize ${getAuroraColor(userLocation.aurora)}`}>
                  {userLocation.aurora.replace('-', ' ')}
                </div>
                {userLocation.aurora === 'extremely-rare' && kpIndex && kpIndex.kpIndex >= 8 && (
                  <div className="text-xs text-solar-orange mt-1">
                    Possible during current G4+ storm!
                  </div>
                )}
              </div>

              <div className="aetheria-glass p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Wifi className="h-4 w-4 text-cosmic-blue" />
                  <span className="text-sm font-medium">HF Radio</span>
                </div>
                <div className={`text-lg font-medium capitalize ${getStatusColor(userLocation.hfRadio)}`}>
                  {userLocation.hfRadio}
                </div>
              </div>

              <div className="aetheria-glass p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Navigation className="h-4 w-4 text-aurora-green" />
                  <span className="text-sm font-medium">GPS Accuracy</span>
                </div>
                <div className={`text-lg font-medium capitalize ${getStatusColor(userLocation.gps)}`}>
                  {userLocation.gps}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-cosmic-blue border-t-transparent" />
          </div>
        )}
      </div>

      {/* Glossary Terms */}
      <div className="aetheria-glass p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="h-5 w-5 text-cosmic-purple" />
          <h3 className="text-lg font-display font-semibold cosmic-glow">
            Interactive Glossary
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {glossaryTerms.map((term) => (
            <button
              key={term.term}
              onClick={() => setSelectedTerm(term)}
              className="aetheria-glass p-4 text-left hover:bg-white/10 transition-all duration-200"
            >
              <div className="font-medium text-sm text-cosmic-blue hover:underline">
                {term.term}
              </div>
              <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {term.definition}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CME Journey Animation */}
      <div className="aetheria-glass p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-solar-orange" />
            <h3 className="text-lg font-display font-semibold cosmic-glow">
              Journey Through a CME
            </h3>
          </div>
          <button
            onClick={() => setShowCMEJourney(true)}
            className="aetheria-glass px-4 py-2 text-sm hover:bg-white/10 transition-colors"
          >
            Watch Animation
          </button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Learn how a Coronal Mass Ejection travels from the Sun to Earth and creates space weather effects.
        </p>
      </div>

      {/* Glossary Modal */}
      {selectedTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
          <div className="aetheria-glass max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold cosmic-glow">{selectedTerm.term}</h4>
                <button
                  onClick={() => setSelectedTerm(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Definition</h5>
                  <p className="text-sm text-muted-foreground">{selectedTerm.definition}</p>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Why it Matters</h5>
                  <p className="text-sm text-muted-foreground">{selectedTerm.explanation}</p>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Related Terms</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedTerm.relatedTerms.map((term) => (
                      <span key={term} className="px-2 py-1 bg-white/10 rounded text-xs">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CME Journey Modal */}
      {showCMEJourney && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
          <div className="aetheria-glass max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold cosmic-glow">CME Journey Animation</h4>
                <button
                  onClick={() => setShowCMEJourney(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="relative h-80 bg-black rounded-lg overflow-hidden border border-white/10">
                  {/* Sun */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-300 animate-pulse shadow-lg shadow-yellow-500/50 z-10">
                    {animationStep >= 1 && (
                      <div className="absolute -right-8 -top-8 w-16 h-16 bg-red-500/70 rounded-full animate-ping blur-md"></div>
                    )}
                  </div>

                  {/* Earth */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-green-500 shadow-md z-10">
                    {/* Magnetosphere */}
                    <div className={`absolute inset-[-10px] rounded-full border-2 border-blue-400/30 ${animationStep >= 3 ? 'border-blue-400/70' : ''} transition-all duration-1000`}></div>
                    
                    {/* Aurora */}
                    {animationStep >= 4 && (
                      <div className="absolute inset-[-3px] rounded-full border-2 border-green-400/70 animate-pulse"></div>
                    )}
                  </div>

                  {/* CME Particle Stream */}
                  {animationStep >= 2 && (
                    <div className="absolute left-28 top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-transparent" style={{
                      width: animationStep >= 3 ? 'calc(100% - 8rem)' : '40%',
                      transition: 'width 1s ease-in-out',
                      boxShadow: '0 0 15px rgba(255, 100, 50, 0.7)'
                    }}></div>
                  )}

                  {/* Impact Particles */}
                  {animationStep >= 3 && (
                    <div className="absolute right-24 top-1/2 -translate-y-1/2 flex gap-1">
                      <span className="w-1 h-1 bg-orange-500 rounded-full animate-ping"></span>
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping delay-100"></span>
                      <span className="w-1 h-1 bg-red-500 rounded-full animate-ping delay-200"></span>
                    </div>
                  )}
                  
                  {/* Magnetic Field Lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Magnetic Field Lines */}
                      <path d="M30,30 C50,40 50,60 80,50" stroke="rgba(120, 160, 255, 0.3)" fill="none" strokeWidth="0.5" />
                      <path d="M30,50 C50,60 50,40 80,60" stroke="rgba(120, 160, 255, 0.3)" fill="none" strokeWidth="0.5" />
                      <path d="M30,70 C50,80 50,20 80,40" stroke="rgba(120, 160, 255, 0.3)" fill="none" strokeWidth="0.5" />
                      
                      {/* Disturbed Field Lines (shown when CME hits) */}
                      {animationStep >= 3 && (
                        <>
                          <path d="M30,30 C40,35 60,25 80,50" stroke="rgba(120, 200, 255, 0.5)" fill="none" strokeWidth="1" className="animate-pulse" />
                          <path d="M30,50 C40,65 60,30 80,60" stroke="rgba(120, 200, 255, 0.5)" fill="none" strokeWidth="1" className="animate-pulse delay-100" />
                          <path d="M30,70 C45,85 55,15 80,40" stroke="rgba(120, 200, 255, 0.5)" fill="none" strokeWidth="1" className="animate-pulse delay-200" />
                        </>
                      )}
                    </svg>
                  </div>
                </div>
                
                {/* Animation Controls */}
                <div className="flex flex-col space-y-3">
                  {/* Step Description */}
                  <div className="bg-white/5 p-3 rounded-md">
                    <h5 className="font-medium text-sm mb-1">
                      {animationStep === 0 && "Start the CME Journey Animation"}
                      {animationStep === 1 && "Step 1: Solar Eruption"}
                      {animationStep === 2 && "Step 2: CME Propagation"}
                      {animationStep === 3 && "Step 3: Magnetosphere Impact"}
                      {animationStep === 4 && "Step 4: Geomagnetic Storm & Aurora"}
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      {animationStep === 0 && "Click 'Play' to begin the animation or use the step buttons to manually explore the CME journey from Sun to Earth."}
                      {animationStep === 1 && "A powerful eruption on the Sun's surface releases a massive cloud of magnetized plasma into space."}
                      {animationStep === 2 && "The CME travels through space at speeds of 500-3000 km/s (1-7 million mph), taking 1-3 days to reach Earth."}
                      {animationStep === 3 && "The CME collides with Earth's protective magnetosphere, causing compression and reconnection of field lines."}
                      {animationStep === 4 && "Solar particles funnel along field lines toward the poles, exciting atmospheric gases and creating aurora displays."}
                    </p>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if (animationStep > 0) setAnimationStep(prev => prev - 1);
                        }}
                        disabled={animationStep === 0}
                        className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                      >
                        Previous
                      </button>
                      <button 
                        onClick={() => {
                          if (animationStep < 4) setAnimationStep(prev => prev + 1);
                        }}
                        disabled={animationStep === 4}
                        className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                      >
                        Next
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => {
                        if (!animationPlaying) {
                          setAnimationPlaying(true);
                          setAnimationStep(0);
                          // Auto-play through all steps
                          const interval = setInterval(() => {
                            setAnimationStep(prev => {
                              if (prev >= 4) {
                                clearInterval(interval);
                                setAnimationPlaying(false);
                                return 4;
                              }
                              return prev + 1;
                            });
                          }, 2000); // Advance every 2 seconds
                        }
                      }}
                      disabled={animationPlaying}
                      className="px-3 py-1 rounded bg-blue-600/70 hover:bg-blue-500/70 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                    >
                      {animationPlaying ? "Playing..." : "Play Animation"}
                    </button>
                  </div>
                  
                  {/* Step Indicator */}
                  <div className="flex justify-between items-center px-1">
                    {[0, 1, 2, 3, 4].map(step => (
                      <div 
                        key={step}
                        className={`w-6 h-1 rounded-full cursor-pointer ${step <= animationStep ? 'bg-blue-400' : 'bg-white/20'}`}
                        onClick={() => setAnimationStep(step)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizedImpact;
