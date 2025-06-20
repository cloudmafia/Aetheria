
const NOAA_BASE_URL = 'https://services.swpc.noaa.gov/json';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export interface SolarFlare {
  beginTime: string;
  peakTime: string;
  endTime: string;
  classType: string;
  sourceLocation: string;
  activeRegion: string;
}

export interface GemagneticData {
  kpIndex: number;
  timestamp: string;
  stormLevel: string;
}

export interface SolarWindData {
  speed: number;
  density: number;
  bt: number;
  bz: number;
  timestamp: string;
}

class SpaceWeatherAPI {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private async fetchWithCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const data = await fetcher();
      this.cache.set(key, { data, timestamp: now });
      return data;
    } catch (error) {
      console.error(`API fetch error for ${key}:`, error);
      // Return cached data if available, even if stale
      if (cached) {
        console.warn(`Using stale cached data for ${key}`);
        return cached.data;
      }
      throw error;
    }
  }

  async getSolarFlares(): Promise<SolarFlare[]> {
    return this.fetchWithCache('solar-flares', async () => {
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(`${NOAA_BASE_URL}/goes/xray-flares-7-day.json`)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      return data.map((flare: any) => ({
        beginTime: flare.begin_time || flare.beginTime,
        peakTime: flare.peak_time || flare.peakTime,
        endTime: flare.end_time || flare.endTime,
        classType: flare.class_type || flare.classType || 'Unknown',
        sourceLocation: flare.source_location || flare.sourceLocation || '',
        activeRegion: flare.active_region || flare.activeRegion || ''
      })).filter((flare: SolarFlare) => flare.classType && flare.classType !== 'Unknown');
    });
  }

  async getCurrentXRayFlux(): Promise<{ timestamp: string; shortFlux: number; longFlux: number }> {
    return this.fetchWithCache('xray-flux', async () => {
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(`${NOAA_BASE_URL}/goes/xray-flux-primary.json`)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Get the most recent reading
      const latest = data[data.length - 1];
      return {
        timestamp: latest.time_tag,
        shortFlux: parseFloat(latest.flux_0_1_8nm) || 0,
        longFlux: parseFloat(latest.flux_0_05_4nm) || 0
      };
    });
  }

  async getKpIndex(): Promise<GemagneticData> {
    return this.fetchWithCache('kp-index', async () => {
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(`${NOAA_BASE_URL}/planetary_k_index_1m.json`)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const latest = data[data.length - 1];
      const kp = parseFloat(latest.kp) || 0;
      
      let stormLevel = 'Quiet';
      if (kp >= 5) stormLevel = 'Storm';
      else if (kp >= 4) stormLevel = 'Active';
      else if (kp >= 3) stormLevel = 'Unsettled';
      
      return {
        kpIndex: kp,
        timestamp: latest.time_tag,
        stormLevel
      };
    });
  }

  async getSolarWind(): Promise<SolarWindData> {
    return this.fetchWithCache('solar-wind', async () => {
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(`${NOAA_BASE_URL}/ace/swepam_1m.json`)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const latest = data[data.length - 1];
      return {
        speed: parseFloat(latest.proton_speed) || 400,
        density: parseFloat(latest.proton_density) || 5,
        bt: parseFloat(latest.bt) || 5,
        bz: parseFloat(latest.bz) || 0,
        timestamp: latest.time_tag
      };
    });
  }

  async getAlerts(): Promise<Array<{
    id: string;
    type: string;
    severity: 'minor' | 'moderate' | 'critical';
    title: string;
    description: string;
    timestamp: string;
    active: boolean;
  }>> {
    return this.fetchWithCache('alerts', async () => {
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(`${NOAA_BASE_URL}/alerts.json`)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      return data.map((alert: any, index: number) => ({
        id: `alert-${index}`,
        type: this.categorizeAlertType(alert.product_id || alert.type),
        severity: this.determineAlertSeverity(alert.product_id || alert.type),
        title: alert.message || alert.title || 'Space Weather Alert',
        description: alert.message || alert.description || 'Space weather conditions detected',
        timestamp: alert.issue_datetime || alert.timestamp || new Date().toISOString(),
        active: true
      }));
    });
  }

  private categorizeAlertType(productId: string): string {
    if (!productId) return 'general';
    const id = productId.toLowerCase();
    if (id.includes('flare') || id.includes('xray')) return 'solar-flare';
    if (id.includes('geomag') || id.includes('storm')) return 'geomagnetic-storm';
    if (id.includes('radio') || id.includes('blackout')) return 'radio-blackout';
    if (id.includes('radiation') || id.includes('proton')) return 'radiation-storm';
    return 'general';
  }

  private determineAlertSeverity(productId: string): 'minor' | 'moderate' | 'critical' {
    if (!productId) return 'minor';
    const id = productId.toLowerCase();
    if (id.includes('warning') || id.includes('watch') || id.includes('x') || id.includes('g3') || id.includes('g4') || id.includes('g5')) {
      return 'critical';
    }
    if (id.includes('advisory') || id.includes('m') || id.includes('g2')) {
      return 'moderate';
    }
    return 'minor';
  }
}

export const spaceWeatherAPI = new SpaceWeatherAPI();
