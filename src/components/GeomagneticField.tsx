
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Globe, Zap, Eye } from 'lucide-react';
import { useSpaceWeatherData } from '../hooks/useSpaceWeatherData';

const GeomagneticField = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [auroraIntensity, setAuroraIntensity] = useState(0.3);
  const { kpIndex, solarWind } = useSpaceWeatherData();

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(350, 350);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Earth
    const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4a9eff,
      transparent: true,
      opacity: 0.7
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Aurora ovals
    const createAuroraOval = (latitude: number, color: number) => {
      const points = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const radius = 1.05;
        const y = Math.sin(latitude * Math.PI / 180) * radius;
        const xzRadius = Math.cos(latitude * Math.PI / 180) * radius;
        points.push(new THREE.Vector3(
          Math.cos(angle) * xzRadius,
          y,
          Math.sin(angle) * xzRadius
        ));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color,
        transparent: true,
        opacity: auroraIntensity
      });
      return new THREE.Line(geometry, material);
    };

    const northernAurora = createAuroraOval(67, 0x00ff88);
    const southernAurora = createAuroraOval(-67, 0x00ff88);
    scene.add(northernAurora);
    scene.add(southernAurora);

    // Magnetic field lines (conceptual)
    const fieldLines = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const points = [];
      
      // Create curved field lines from north to south pole
      for (let j = 0; j <= 20; j++) {
        const t = j / 20;
        const latitude = Math.PI/2 - t * Math.PI;
        const radius = 1.5 + Math.sin(t * Math.PI) * 0.8;
        
        points.push(new THREE.Vector3(
          Math.cos(angle) * Math.sin(latitude) * radius,
          Math.cos(latitude) * radius,
          Math.sin(angle) * Math.sin(latitude) * radius
        ));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.4
      });
      const line = new THREE.Line(geometry, material);
      fieldLines.push(line);
      scene.add(line);
    }

    // Solar wind stream (conceptual)
    const windPoints = [];
    for (let i = 0; i < 50; i++) {
      windPoints.push(new THREE.Vector3(-5 + i * 0.1, 0, 0));
    }
    const windGeometry = new THREE.BufferGeometry().setFromPoints(windPoints);
    const windMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffd700,
      transparent: true,
      opacity: 0.6
    });
    const solarWind = new THREE.Line(windGeometry, windMaterial);
    scene.add(solarWind);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 1, 1);
    scene.add(directionalLight);

    camera.position.set(3, 2, 3);
    camera.lookAt(0, 0, 0);

    // Mouse controls
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    mountRef.current.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate Earth
      earth.rotation.y += 0.002;
      
      // Animate field lines
      fieldLines.forEach((line, index) => {
        line.rotation.y += 0.001 * (index % 2 === 0 ? 1 : -1);
      });
      
      // Aurora pulsing
      const pulse = Math.sin(Date.now() * 0.003) * 0.2 + 0.5;
      northernAurora.material.opacity = auroraIntensity * pulse;
      southernAurora.material.opacity = auroraIntensity * pulse;
      
      // Slight camera movement based on mouse
      camera.position.x = 3 + mouseX * 0.5;
      camera.position.y = 2 + mouseY * 0.5;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      mountRef.current?.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
    };
  }, [auroraIntensity]);

  // Update aurora intensity based on space weather
  useEffect(() => {
    if (kpIndex) {
      const intensity = Math.min(kpIndex.kpIndex / 9, 1) * 0.8 + 0.2;
      setAuroraIntensity(intensity);
    }
  }, [kpIndex]);

  return (
    <div className="aetheria-glass p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Globe className="h-5 w-5 text-cosmic-purple" />
        <h3 className="text-lg font-display font-semibold cosmic-glow">
          Geomagnetic Field & Aurora
        </h3>
      </div>

      <div className="relative">
        <div ref={mountRef} className="flex justify-center" />
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="aetheria-glass p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-4 w-4 text-aurora-green" />
              <span className="text-sm font-medium">Aurora Activity</span>
            </div>
            <div className="text-lg font-mono text-aurora-green">
              {kpIndex ? `Kp ${kpIndex.kpIndex.toFixed(1)}` : 'Loading...'}
            </div>
            <div className="text-xs text-muted-foreground">
              {kpIndex?.stormLevel || 'Quiet'}
            </div>
          </div>

          <div className="aetheria-glass p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="h-4 w-4 text-cosmic-blue" />
              <span className="text-sm font-medium">Solar Wind Bz</span>
            </div>
            <div className="text-lg font-mono text-cosmic-blue">
              {solarWind ? `${solarWind.bz.toFixed(1)} nT` : 'Loading...'}
            </div>
            <div className="text-xs text-muted-foreground">
              {solarWind && solarWind.bz < 0 ? 'Southward' : 'Northward'}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          Interactive 3D model • Hover to explore
        </div>
      </div>
    </div>
  );
};

export default GeomagneticField;
