
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { satellite } from 'satellite.js';
import { Orbit, Satellite, Info } from 'lucide-react';

interface SatelliteData {
  name: string;
  tle1: string;
  tle2: string;
  category: 'weather' | 'navigation' | 'science' | 'iss';
}

const SatelliteTracker = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const [selectedSatellite, setSelectedSatellite] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sample TLE data - in production, fetch from Celestrak
  const satellites: SatelliteData[] = [
    {
      name: 'GOES-16',
      tle1: '1 41866U 16069A   24001.00000000  .00000000  00000-0  00000-0 0  9990',
      tle2: '2 41866   0.0000 000.0000 0000000  00.0000 000.0000  1.00273790     07',
      category: 'weather'
    },
    {
      name: 'ISS',
      tle1: '1 25544U 98067A   24001.12345678  .00002182  00000-0  40864-4 0  9992',
      tle2: '2 25544  51.6461 339.0375 0005156  85.6398  15.2426 15.48919103123456',
      category: 'iss'
    }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(400, 400);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Earth geometry
    const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
    const earthTexture = new THREE.TextureLoader().load('/placeholder.svg');
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
    satellites.forEach((sat, index) => {
      const satGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const satMaterial = new THREE.MeshBasicMaterial({ 
        color: sat.category === 'iss' ? 0x00ff00 : 0xffffff,
        transparent: true
      });
      const satMesh = new THREE.Mesh(satGeometry, satMaterial);
      
      // Calculate satellite position using SGP4
      const satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
      const now = new Date();
      const positionAndVelocity = satellite.propagate(satrec, now);
      
      if (positionAndVelocity.position && typeof positionAndVelocity.position !== 'boolean') {
        const gmst = satellite.gstime(now);
        const positionEci = positionAndVelocity.position;
        const positionEcf = satellite.eciToEcf(positionEci, gmst);
        
        // Convert to Three.js coordinates (scaled)
        const scale = 1 / 6371; // Earth radius in km
        satMesh.position.set(
          positionEcf.x * scale,
          positionEcf.z * scale,
          -positionEcf.y * scale
        );
      }
      
      scene.add(satMesh);
      
      // Orbital path
      const orbitPoints = [];
      for (let i = 0; i < 100; i++) {
        const futureTime = new Date(now.getTime() + i * 60000);
        const futurePos = satellite.propagate(satrec, futureTime);
        if (futurePos.position && typeof futurePos.position !== 'boolean') {
          const gmst = satellite.gstime(futureTime);
          const posEcf = satellite.eciToEcf(futurePos.position, gmst);
          orbitPoints.push(new THREE.Vector3(
            posEcf.x * scale,
            posEcf.z * scale,
            -posEcf.y * scale
          ));
        }
      }
      
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: 0x60a5fa, 
        transparent: true, 
        opacity: 0.6 
      });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbitLine);
    });

    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      earth.rotation.y += 0.002;
      innerBelt.rotation.x += 0.001;
      outerBelt.rotation.x -= 0.001;
      
      renderer.render(scene, camera);
    };

    animate();
    setIsLoading(false);

    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="aetheria-glass p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Orbit className="h-5 w-5 text-cosmic-blue" />
          <h3 className="text-lg font-display font-semibold cosmic-glow">
            Real-time Satellite Tracking
          </h3>
        </div>
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-cosmic-blue border-t-transparent" />
        )}
      </div>

      <div className="relative">
        <div ref={mountRef} className="flex justify-center" />
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          {satellites.map((sat) => (
            <button
              key={sat.name}
              onClick={() => setSelectedSatellite(sat.name)}
              className={`aetheria-glass p-3 text-sm transition-all duration-200 hover:bg-white/10 ${
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
    </div>
  );
};

export default SatelliteTracker;
