
import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, Zap } from 'lucide-react';

interface SolarImage {
  wavelength: string;
  url: string;
  description: string;
  color: string;
  lastUpdated: string;
}

const SolarImageryGrid = () => {
  const [images, setImages] = useState<SolarImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<SolarImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Mock solar imagery data with realistic URLs and descriptions
  const solarImageryData: SolarImage[] = [
    {
      wavelength: 'AIA 171',
      url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0171.jpg',
      description: 'Iron IX - Shows the hot corona and active region loops',
      color: 'from-teal-400 to-blue-500',
      lastUpdated: new Date().toISOString()
    },
    {
      wavelength: 'AIA 304',
      url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0304.jpg',
      description: 'Helium II - Highlights chromosphere and transition region',
      color: 'from-red-400 to-orange-500',
      lastUpdated: new Date().toISOString()
    },
    {
      wavelength: 'AIA 193',
      url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0193.jpg',
      description: 'Iron XII - Hot corona and flaring regions',
      color: 'from-yellow-400 to-amber-500',
      lastUpdated: new Date().toISOString()
    },
    {
      wavelength: 'HMI Continuum',
      url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIIC.jpg',
      description: 'White-light view showing sunspots',
      color: 'from-gray-300 to-gray-500',
      lastUpdated: new Date().toISOString()
    },
    {
      wavelength: 'HMI Magnetogram',
      url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIB.jpg',
      description: 'Magnetic polarity of sunspot regions',
      color: 'from-purple-400 to-indigo-500',
      lastUpdated: new Date().toISOString()
    },
    {
      wavelength: 'AIA 131',
      url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0131.jpg',
      description: 'Iron VIII - Solar flares and very hot plasma',
      color: 'from-cyan-400 to-teal-500',
      lastUpdated: new Date().toISOString()
    }
  ];

  useEffect(() => {
    const loadImages = () => {
      setIsLoading(true);
      // Simulate loading delay for realistic experience
      setTimeout(() => {
        setImages(solarImageryData);
        setLastUpdate(new Date());
        setIsLoading(false);
      }, 1000);
    };

    loadImages();
    // Update images every 5 minutes
    const interval = setInterval(loadImages, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLastUpdate(new Date());
    // Force reload images by updating timestamps
    setImages(prev => prev.map(img => ({
      ...img,
      lastUpdated: new Date().toISOString(),
      url: `${img.url}?t=${Date.now()}`
    })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-display font-bold cosmic-glow">
            Multi-Wavelength Solar Observatory
          </h3>
          <p className="text-muted-foreground">Real-time imagery from NASA's Solar Dynamics Observatory</p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdate && (
            <span className="text-sm text-muted-foreground">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={handleRefresh}
            className="aetheria-button flex items-center space-x-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aetheria-glass aspect-square animate-pulse">
              <div className="w-full h-full bg-white/10 rounded-xl flex items-center justify-center">
                <Zap className="h-8 w-8 text-cosmic-blue animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="aetheria-glass aspect-square cursor-pointer group hover:scale-105 transition-transform duration-300"
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative w-full h-full overflow-hidden rounded-xl">
                <img 
                  src={image.url}
                  alt={`Solar ${image.wavelength}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className={`text-xs font-mono font-bold bg-gradient-to-r ${image.color} bg-clip-text text-transparent`}>
                    {image.wavelength}
                  </div>
                  <div className="text-xs text-white/80 mt-1">
                    SDO/AIA • Live
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for expanded image view */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
          <div className="aetheria-glass max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="relative">
              <img 
                src={selectedImage.url}
                alt={`Solar ${selectedImage.wavelength}`}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <h4 className={`text-xl font-bold bg-gradient-to-r ${selectedImage.color} bg-clip-text text-transparent mb-2`}>
                {selectedImage.wavelength}
              </h4>
              <p className="text-muted-foreground mb-4">{selectedImage.description}</p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>NASA Solar Dynamics Observatory</span>
                <span>Updated: {new Date(selectedImage.lastUpdated).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolarImageryGrid;
