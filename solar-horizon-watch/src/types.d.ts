// Type declarations for modules without TypeScript definitions

declare module 'satellite.js' {
  export namespace satellite {
    export function propagate(satrec: any, date: Date): { position: { x: number; y: number; z: number } | boolean; velocity?: any };
    export function twoline2satrec(tleLine1: string, tleLine2: string): any;
    export function gstime(date: Date): number;
    export function eciToEcf(positionEci: { x: number; y: number; z: number }, gmst: number): { x: number; y: number; z: number };
  }
}

// Extend existing modules if needed
declare module 'three' {
  // Add any missing Three.js types here if necessary
}

declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export const RefreshCw: FC<SVGProps<SVGSVGElement>>;
  export const Info: FC<SVGProps<SVGSVGElement>>;
  export const Satellite: FC<SVGProps<SVGSVGElement>>;
  // Add any other icons you're using
}

// Define any global variables
interface Window {
  // Add any custom window properties here if needed
}
