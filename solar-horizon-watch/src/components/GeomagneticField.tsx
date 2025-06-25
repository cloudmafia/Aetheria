
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

    // Earth with enhanced appearance
    const earthGeometry = new THREE.SphereGeometry(1, 48, 48);
    
    // Create gradient texture for Earth
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    if (context) {
      // Create gradient from deep blue to lighter blue
      const gradient = context.createLinearGradient(0, 0, 0, 256);
      gradient.addColorStop(0, '#123363');
      gradient.addColorStop(0.5, '#4a9eff');
      gradient.addColorStop(1, '#6db5ff');
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 512, 256);
      
      // Add some noise/texture
      for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        const r = Math.random() * 1.5;
        context.beginPath();
        context.arc(x, y, r, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255,255,255,0.1)';
        context.fill();
      }
    }
    
    const earthTexture = new THREE.CanvasTexture(canvas);
    const earthMaterial = new THREE.MeshPhongMaterial({ 
      map: earthTexture,
      shininess: 10,
      specular: 0x333333,
      bumpScale: 0.05
    });
    
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // Add atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(1.02, 48, 48);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a9eff,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.scale.set(1.1, 1.1, 1.1);
    scene.add(atmosphere);

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

  // Determine aurora visibility status based on Kp index
  const getAuroraVisibility = (kp: number | undefined) => {
    if (!kp) return { status: 'Unknown', color: 'text-muted-foreground' };
    
    if (kp >= 5) return { status: 'High', color: 'text-aurora-green' };
    if (kp >= 3) return { status: 'Moderate', color: 'text-solar-orange' };
    return { status: 'Low', color: 'text-cosmic-blue' };
  };
  
  // Get aurora forecast regions based on Kp
  const getAuroraRegions = (kp: number | undefined) => {
    if (!kp) return [];
    const regions = [];
    
    if (kp >= 3) regions.push('Alaska, Canada, Northern Europe');
    if (kp >= 5) regions.push('Northern US, UK, Germany');
    if (kp >= 7) regions.push('Mid-US, Central Europe');
    if (kp >= 9) regions.push('Southern US, Mediterranean');
    
    return regions.length ? regions : ['Very limited polar regions only'];
  };
  
  const visibility = getAuroraVisibility(kpIndex?.kpIndex);
  const impactLevel = solarWind && solarWind.bz < -10 ? 'High' : 
                    solarWind && solarWind.bz < -5 ? 'Moderate' : 'Low';

  return (
    <div className="aetheria-glass p-4 h-full">
      <div className="flex items-center space-x-2 mb-3">
        <Globe className="h-4 w-4 text-cosmic-purple" />
        <h3 className="text-base font-display font-semibold cosmic-glow">
          Geomagnetic Field & Aurora
        </h3>
      </div>

      <div className="relative">
        {/* 3D Earth visualization */}
        <div ref={mountRef} className="flex justify-center h-56 mb-2" />
        
        <div className="grid grid-cols-1 gap-3">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="aetheria-glass p-2">
              <div className="flex items-center space-x-1 mb-1">
                <Zap className="h-3 w-3 text-aurora-green" />
                <span className="text-xs font-medium">Kp Index</span>
              </div>
              <div className="text-base font-mono text-aurora-green">
                {kpIndex ? kpIndex.kpIndex.toFixed(1) : '—'}
              </div>
            </div>
            
            <div className="aetheria-glass p-2">
              <div className="flex items-center space-x-1 mb-1">
                <Eye className="h-3 w-3 text-cosmic-blue" />
                <span className="text-xs font-medium">Solar Wind</span>
              </div>
              <div className="text-base font-mono text-cosmic-blue">
                {solarWind ? `${solarWind.bz.toFixed(1)} nT` : '—'}
              </div>
            </div>
            
            <div className="aetheria-glass p-2">
              <div className="flex items-center space-x-1 mb-1">
                <Eye className="h-3 w-3 text-solar-orange" />
                <span className="text-xs font-medium">Speed</span>
              </div>
              <div className="text-base font-mono text-solar-orange">
                {solarWind ? `${solarWind.speed} km/s` : '—'}
              </div>
            </div>
          </div>
          
          {/* Impact Assessment */}
          <div className="aetheria-glass p-2 text-xs">
            <h4 className="font-medium mb-1">Current Conditions</h4>
            <div className="flex flex-wrap gap-1 mb-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-black/20 text-2xs">
                Aurora: <span className={`ml-1 ${visibility.color} font-medium`}>{visibility.status}</span>
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-black/20 text-2xs">
                Field Impact: <span className={`ml-1 ${impactLevel === 'High' ? 'text-solar-orange' : 'text-cosmic-blue'} font-medium`}>{impactLevel}</span>
              </span>
            </div>
            
            <h4 className="font-medium mb-1">Potential Aurora Visibility</h4>
            <ul className="list-disc list-inside text-2xs text-muted-foreground space-y-0.5">
              {getAuroraRegions(kpIndex?.kpIndex).map((region, i) => (
                <li key={i}>{region}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-2 text-2xs text-muted-foreground text-center">
          <span className="inline-block border-b border-dotted border-muted-foreground/30 cursor-help"
               title="Hover or touch the 3D model to explore the Earth's magnetic field and aurora">
            Interactive 3D visualization • Hover to explore
          </span>
        </div>
      </div>
    </div>
  );
};

export default GeomagneticField;
