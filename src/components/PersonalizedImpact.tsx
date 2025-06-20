
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
                <div className="h-64 bg-gradient-to-r from-yellow-400 via-red-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-lg font-bold mb-2">🌞 ➡️ 🌍</div>
                    <div className="text-sm">Animated CME Journey</div>
                    <div className="text-xs mt-2 opacity-75">
                      Sun → Solar Wind → Magnetosphere → Aurora
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>This interactive animation would show:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>CME eruption from solar active region</li>
                    <li>Propagation through interplanetary space</li>
                    <li>Interaction with Earth's magnetosphere</li>
                    <li>Formation of geomagnetic storm and aurora</li>
                  </ul>
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
