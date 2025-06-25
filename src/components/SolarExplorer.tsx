import React, { useState, useRef, useEffect } from 'react';
import ZoomIn from 'lucide-react/dist/esm/icons/zoom-in';
import ZoomOut from 'lucide-react/dist/esm/icons/zoom-out';
import Move from 'lucide-react/dist/esm/icons/move';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';

interface SolarImage {
  wavelength: string;
  url: string;
  description: string;
  color: string; // tailwind gradient classes
}

const images: SolarImage[] = [
  {
    wavelength: 'AIA 171',
    url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0171.jpg',
    description: 'Iron IX – corona loops (~630,000 K).',
    color: 'from-teal-400 to-blue-500',
  },
  {
    wavelength: 'AIA 304',
    url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0304.jpg',
    description: 'Helium II – chromosphere (~50,000 K).',
    color: 'from-red-400 to-orange-500',
  },
  {
    wavelength: 'AIA 193',
    url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0193.jpg',
    description: 'Iron XII – corona & flaring regions (~1.6M K).',
    color: 'from-yellow-400 to-amber-500',
  },
  {
    wavelength: 'HMI Continuum',
    url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIIC.jpg',
    description: 'White-light view – sunspots & photosphere.',
    color: 'from-gray-300 to-gray-500',
  },
  {
    wavelength: 'HMI Magnetogram',
    url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIB.jpg',
    description: 'Line-of-sight magnetogram – polarity of regions.',
    color: 'from-purple-400 to-indigo-500',
  },
  {
    wavelength: 'AIA 131',
    url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0131.jpg',
    description: 'Iron VIII – hottest flare plasma (~10M K).',
    color: 'from-cyan-400 to-teal-500',
  },
];

const SolarExplorer: React.FC = () => {
  const [current, setCurrent] = useState<SolarImage>(images[0]);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY || e.deltaX;
      setZoom((z) => Math.min(5, Math.max(0.5, z + delta * 0.001)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPos({ x: e.clientX - start.x, y: e.clientY - start.y });
  };
  const handleMouseUp = () => setDragging(false);

  const reset = () => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  };

  return (
    <div className="aetheria-glass p-4 space-y-4">
      {/* Selector */}
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {images.map((img) => (
          <button
            key={img.wavelength}
            onClick={() => setCurrent(img)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-sm bg-gradient-to-r ${img.color} bg-clip-text text-transparent border border-white/10 hover:border-cosmic-blue transition-colors ${current.wavelength === img.wavelength ? 'ring-2 ring-cosmic-blue' : ''}`}
          >
            {img.wavelength}
          </button>
        ))}
      </div>

      {/* Viewer */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg bg-black/30" style={{ height: '450px' }}
      >
        <img
          ref={imgRef}
          src={`${current.url}?t=${current === images[0] ? '' : Date.now()}`}
          alt={current.wavelength}
          draggable={false}
          className="absolute top-1/2 left-1/2 select-none"
          style={{
            transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: dragging ? 'none' : 'transform 0.1s',
            cursor: dragging ? 'grabbing' : 'grab',
            maxWidth: 'none',
            maxHeight: 'none',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={reset}
        />

        {/* Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <button
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80"
            onClick={() => setZoom((z) => Math.min(5, z + 0.25))}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80"
            onClick={reset}
          >
            <Move className="h-4 w-4" />
          </button>
        </div>

        {/* Zoom indicator */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Description */}
      <div>
        <h4 className={`text-xl font-bold bg-gradient-to-r ${current.color} bg-clip-text text-transparent mb-1`}>
          {current.wavelength}
        </h4>
        <p className="text-sm text-muted-foreground mb-1">{current.description}</p>
        <p className="text-xs text-muted-foreground flex items-center">
          <RefreshCw className="h-3 w-3 mr-1" /> Updated {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default SolarExplorer;
