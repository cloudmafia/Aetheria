// Service to fetch satellite TLE data from public sources
// We're using the CelesTrak API which provides free, up-to-date TLE data

export interface SatelliteData {
  name: string;
  id: string;
  tle: string[];
  type: 'iss' | 'weather' | 'science' | 'communication' | 'other';
}

class SatelliteDataAPI {
  private cache = new Map<string, { data: SatelliteData[]; timestamp: number }>();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache for TLE data (they don't change very frequently)

  private async fetchWithRetry(url: string, retries = 2): Promise<Response> {
    let lastError: Error;
    
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/text',
            'User-Agent': 'Aetheria-Solar-Horizon-Watch/1.0'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response;
      } catch (error) {
        console.error(`Attempt ${i + 1}/${retries + 1} failed:`, error);
        lastError = error as Error;
        
        if (i < retries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    
    throw lastError!;
  }

  private parseTLEData(rawData: string): SatelliteData[] {
    const lines = rawData.trim().split('\n');
    const satellites: SatelliteData[] = [];
    
    // Process the TLE data in groups of 3 lines (name + two TLE lines)
    for (let i = 0; i < lines.length; i += 3) {
      if (i + 2 < lines.length) {
        const name = lines[i].trim();
        const tleLine1 = lines[i + 1].trim();
        const tleLine2 = lines[i + 2].trim();
        
        // Basic validation to ensure we have a valid TLE format
        if (tleLine1.startsWith('1 ') && tleLine2.startsWith('2 ')) {
          // Extract NORAD ID from the TLE
          const noradIdMatch = tleLine1.match(/^\d+\s+(\d+)/);
          const noradId = noradIdMatch ? noradIdMatch[1] : 'unknown';
          
          // Determine satellite type based on name or ID
          let type: SatelliteData['type'] = 'other';
          const lowerName = name.toLowerCase();
          
          if (lowerName.includes('iss') || noradId === '25544') {
            type = 'iss';
          } else if (lowerName.includes('noaa') || lowerName.includes('goes') || lowerName.includes('meteo')) {
            type = 'weather';
          } else if (lowerName.includes('hubble') || lowerName.includes('telescope')) {
            type = 'science';
          } else if (lowerName.includes('iridium') || lowerName.includes('starlink')) {
            type = 'communication';
          }
          
          satellites.push({
            name,
            id: noradId,
            tle: [tleLine1, tleLine2],
            type
          });
        }
      }
    }
    
    return satellites;
  }

  async getISSTLE(): Promise<SatelliteData | null> {
    try {
      const satellites = await this.getMultipleSatellitesTLE(['iss']);
      return satellites.find(sat => sat.type === 'iss') || null;
    } catch (error) {
      console.error('Failed to fetch ISS TLE data:', error);
      return null;
    }
  }

  async getWeatherSatellitesTLE(): Promise<SatelliteData[]> {
    try {
      // Get NOAA and GOES weather satellites
      const satellites = await this.getMultipleSatellitesTLE(['noaa', 'goes']);
      return satellites.filter(sat => sat.type === 'weather');
    } catch (error) {
      console.error('Failed to fetch weather satellites TLE data:', error);
      return [];
    }
  }

  async getMultipleSatellitesTLE(groups: string[]): Promise<SatelliteData[]> {
    const cacheKey = groups.join(',');
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    
    try {
      // Use CelesTrak's API to get satellite data by group name
      const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${groups.join('&GROUP=')}&FORMAT=tle`;
      const response = await this.fetchWithRetry(url);
      const text = await response.text();
      
      const satellites = this.parseTLEData(text);
      this.cache.set(cacheKey, { data: satellites, timestamp: now });
      
      return satellites;
    } catch (error) {
      console.error('Error fetching satellite TLE data:', error);
      
      // If cached data is available but expired, use it as fallback
      if (cached) {
        console.warn('Using expired cached TLE data');
        return cached.data;
      }
      
      // Fallback to hardcoded ISS TLE data when all else fails
      if (groups.includes('iss')) {
        return [{
          name: 'ISS (ZARYA)',
          id: '25544',
          tle: [
            '1 25544U 98067A   23275.52277778  .00008126  00000+0  15058-3 0  9992',
            '2 25544  51.6415 175.2863 0006256  76.9553 283.4499 15.49683893420396'
          ],
          type: 'iss'
        }];
      }
      
      return [];
    }
  }
}

export const satelliteDataAPI = new SatelliteDataAPI();
