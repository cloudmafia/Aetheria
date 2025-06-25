import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as satellite from 'satellite.js';
import { RefreshCw, Info, Satellite } from 'lucide-react';
import { satelliteDataAPI, SatelliteData as SatelliteTLEData } from '../services/satelliteDataApi';
import ErrorBoundary from './ErrorBoundary';

// Interface for the satellite objects in our visualization
interface VisualizationSatellite {
  name: string;
  id: string;
  tle: string[];
  category: 'weather' | 'navigation' | 'science' | 'iss' | 'communication' | 'other';
}

const SatelliteTracker: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const satellitesRef = useRef<THREE.Object3D[]>([]);
  const frameRef = useRef<number | null>(null);
  
  const [satelliteData, setSatelliteData] = useState<VisualizationSatellite[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSatellite, setSelectedSatellite] = useState<string | null>(null);

  const fetchSatelliteData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch ISS and weather satellite data
      const iss = await satelliteDataAPI.getISSTLE();
      const weatherSats = await satelliteDataAPI.getWeatherSatellitesTLE();

      // Combine and filter out any null values
      const satellites = [iss, ...weatherSats].filter(Boolean) as SatelliteTLEData[];
      
      if (satellites.length === 0) {
        throw new Error('No satellite data available');
      }
      
      // Convert from API format to our visualization format
      const visualSatellites: VisualizationSatellite[] = satellites.map(sat => ({
        name: sat.name,
        id: sat.id,
        tle: sat.tle,
        category: sat.type as 'iss' | 'weather' | 'science' | 'communication' | 'other'
      }));
      
      setSatelliteData(visualSatellites);
    } catch (err) {
      setError('Failed to load satellite data. Using fallback data.');
      // Use hardcoded fallback data for ISS
      // Convert to our visualization format
      setSatelliteData([{
        name: 'ISS (ZARYA)',
        id: '25544',
        tle: [
          '1 25544U 98067A   23275.52277778  .00008126  00000+0  15058-3 0  9992',
          '2 25544  51.6415 175.2863 0006256  76.9553 283.4499 15.49683893420396'
        ],
        category: 'iss'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch satellite data when component mounts
    fetchSatelliteData();

    // Refresh data every 2 hours
    const refreshInterval = setInterval(fetchSatelliteData, 2 * 60 * 60 * 1000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  // Function to handle resize event for the 3D view
  const handleResize = () => {
    if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
    
    // Get the container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = Math.min(400, window.innerHeight * 0.4); // Cap height while maintaining aspect ratio
    
    // Update renderer size
    rendererRef.current.setSize(containerWidth, containerHeight);
    
    // Update camera aspect ratio
    cameraRef.current.aspect = containerWidth / containerHeight;
    cameraRef.current.updateProjectionMatrix();
  };

  useEffect(() => {
    const init = () => {
      if (!containerRef.current) return;

      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      
      // Initial size setup
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = Math.min(400, window.innerHeight * 0.4);
      renderer.setSize(containerWidth, containerHeight);
      camera.aspect = containerWidth / containerHeight;
      camera.updateProjectionMatrix();
      renderer.setClearColor(0x000000, 0);
      containerRef.current.appendChild(renderer.domElement);

      // Earth geometry
      const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
      const textureLoader = new THREE.TextureLoader();

      // Add error handling for texture loading
      const earthTexture = textureLoader.load(
        '/earth-texture.svg',
        undefined,
        undefined,
        (error) => {
          console.error('Error loading Earth texture:', error);
          // Fallback to a basic material if texture fails to load
          earth.material = new THREE.MeshBasicMaterial({
            color: 0x1a53b0, // fallback blue color
            wireframe: true
          });
        }
      );

      const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        transparent: true,
        opacity: 0.8
      });
      const earth = new THREE.Mesh(earthGeometry, earthMaterial);
      scene.add(earth);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      // Radiation belts (conceptual)
      const innerBeltGeometry = new THREE.TorusGeometry(1.5, 0.2, 8, 16);
      const outerBeltGeometry = new THREE.TorusGeometry(2.2, 0.3, 8, 16);
      const beltMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6b6b,
        transparent: true,
        opacity: 0.3,
        wireframe: true
      });

      const innerBelt = new THREE.Mesh(innerBeltGeometry, beltMaterial);
      const outerBelt = new THREE.Mesh(outerBeltGeometry, beltMaterial);
      scene.add(innerBelt);
      scene.add(outerBelt);

      // Satellite positions
      if (!satelliteData || satelliteData.length === 0) {
        return; // Don't try to render satellites if we have no data
      }

      // Clear existing satellites
      satellitesRef.current.forEach(obj => scene.remove(obj));
      satellitesRef.current = [];

      // Create satellites from data
      satelliteData.forEach((sat, index) => {
        try {
          // Calculate satellite position
          const positionAndVelocity = satellite.propagate(
            satellite.twoline2satrec(sat.tle[0], sat.tle[1]),
            new Date()
          );

          if (positionAndVelocity.position) {
            const position = positionAndVelocity.position;

            // Convert km to scaled 3D units
            const scale = 0.001;
            const x = position.x * scale;
            const y = position.y * scale;
            const z = position.z * scale;

            // Create satellite object with different colors based on type
            let color;
            let size = 0.02;

            switch (sat.category) {
              case 'iss':
                color = 0xff0000; // Red for ISS
                size = 0.03; // Slightly larger
                break;
              case 'weather':
                color = 0x00ffff; // Cyan for weather satellites
                break;
              case 'science':
                color = 0xffff00; // Yellow for science satellites
                break;
              case 'communication':
                color = 0x00ff00; // Green for communication satellites
                break;
              default:
                color = 0xffffff; // White for others
            }

            const satGeometry = new THREE.SphereGeometry(size, 8, 8);
            const satMaterial = new THREE.MeshBasicMaterial({ color });
            const satMesh = new THREE.Mesh(satGeometry, satMaterial);
            satMesh.position.set(x, z, -y); // Note: different coordinate systems
            satMesh.userData = { name: sat.name, id: sat.id, type: sat.category };
            scene.add(satMesh);
            satellitesRef.current.push(satMesh);
          }
        } catch (err) {
          console.error(`Failed to process satellite ${sat.name}:`, err);
        }
      });

      camera.position.z = 5;

      // Add event listener for window resize
      window.addEventListener('resize', handleResize);

      // Animation loop
      const animate = () => {
        const frame = requestAnimationFrame(animate);
        frameRef.current = frame;

        earth.rotation.y += 0.002;
        innerBelt.rotation.x += 0.001;
        outerBelt.rotation.x -= 0.001;

        renderer.render(scene, camera);
      };

      animate();

      // Store references
      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
    };

    return () => {
      // Remove resize event listener
      window.removeEventListener('resize', handleResize);
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      if (containerRef.current && rendererRef.current && rendererRef.current.domElement) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [satelliteData]);

  return (
    <ErrorBoundary componentName="Satellite Tracker">
      <div className="aetheria-glass p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
          <div className="flex items-center space-x-2">
            <Satellite className="h-5 w-5 text-cosmic-blue" />
            <h3 className="text-base sm:text-lg font-display font-semibold cosmic-glow">
              Real-time Satellite Tracking
            </h3>
          </div>
          <button 
            className="p-1 hover:bg-accent rounded-full"
            aria-label="Refresh data"
            onClick={fetchSatelliteData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="relative w-full">
          <div 
            ref={containerRef} 
            className="w-full flex justify-center"
            style={{ height: 'calc(40vh - 100px)', maxHeight: '400px', minHeight: '200px' }} 
          />
          
          {/* Satellite status indicator */}
          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/70 p-1 rounded">
            <div className="flex items-center gap-1">
              <Satellite className="h-3 w-3" />
              <span>{satelliteData.length} satellites tracked</span>
            </div>
            {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
          {satelliteData.map((sat) => (
            <button
              key={sat.id}
              onClick={() => setSelectedSatellite(sat.name)}
              className={`aetheria-glass p-2 sm:p-3 text-xs sm:text-sm transition-all duration-200 hover:bg-white/10 ${
                selectedSatellite === sat.name ? 'ring-2 ring-cosmic-blue' : ''
              }`}
            >
              <div className="flex items-center space-x-2">
                <Satellite className={`h-4 w-4 ${
                  sat.category === 'iss' ? 'text-aurora-green' : 'text-cosmic-blue'
                }`} />
                <span className="font-medium">{sat.name}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 capitalize">
                {sat.category}
              </div>
            </button>
          ))}
        </div>

        {selectedSatellite && (
          <div className="mt-4 aetheria-glass p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-4 w-4 text-aurora-green" />
              <span className="font-medium">{selectedSatellite}</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Position: Real-time orbital tracking</div>
              <div>Status: Active</div>
              <div>Orbital Period: ~90-1440 minutes</div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SatelliteTracker;
