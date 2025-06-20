
import { useState, useEffect, useCallback } from 'react';
import { spaceWeatherAPI, SolarFlare, GemagneticData, SolarWindData } from '../services/spaceWeatherApi';

interface SpaceWeatherData {
  solarFlares: SolarFlare[];
  currentFlux: { timestamp: string; shortFlux: number; longFlux: number } | null;
  kpIndex: GemagneticData | null;
  solarWind: SolarWindData | null;
  alerts: Array<{
    id: string;
    type: string;
    severity: 'minor' | 'moderate' | 'critical';
    title: string;
    description: string;
    timestamp: string;
    active: boolean;
  }>;
  isLoading: boolean;
  lastUpdate: Date | null;
  errors: Record<string, string>;
}

export const useSpaceWeatherData = (refreshInterval: number = 300000) => { // 5 minutes default
  const [data, setData] = useState<SpaceWeatherData>({
    solarFlares: [],
    currentFlux: null,
    kpIndex: null,
    solarWind: null,
    alerts: [],
    isLoading: true,
    lastUpdate: null,
    errors: {}
  });

  const fetchAllData = useCallback(async () => {
    console.log('Fetching space weather data...');
    const errors: Record<string, string> = {};
    const updates: Partial<SpaceWeatherData> = {};

    try {
      const flares = await spaceWeatherAPI.getSolarFlares();
      updates.solarFlares = flares;
      console.log(`Fetched ${flares.length} solar flares`);
    } catch (error) {
      console.error('Failed to fetch solar flares:', error);
      errors.solarFlares = 'Failed to load solar flare data';
    }

    try {
      const flux = await spaceWeatherAPI.getCurrentXRayFlux();
      updates.currentFlux = flux;
      console.log('Fetched X-ray flux:', flux);
    } catch (error) {
      console.error('Failed to fetch X-ray flux:', error);
      errors.currentFlux = 'Failed to load X-ray flux data';
    }

    try {
      const kp = await spaceWeatherAPI.getKpIndex();
      updates.kpIndex = kp;
      console.log('Fetched Kp index:', kp);
    } catch (error) {
      console.error('Failed to fetch Kp index:', error);
      errors.kpIndex = 'Failed to load geomagnetic data';
    }

    try {
      const wind = await spaceWeatherAPI.getSolarWind();
      updates.solarWind = wind;
      console.log('Fetched solar wind:', wind);
    } catch (error) {
      console.error('Failed to fetch solar wind:', error);
      errors.solarWind = 'Failed to load solar wind data';
    }

    try {
      const alerts = await spaceWeatherAPI.getAlerts();
      updates.alerts = alerts;
      console.log(`Fetched ${alerts.length} alerts`);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      errors.alerts = 'Failed to load alerts';
    }

    setData(prev => ({
      ...prev,
      ...updates,
      isLoading: false,
      lastUpdate: new Date(),
      errors
    }));
  }, []);

  useEffect(() => {
    fetchAllData();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchAllData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAllData, refreshInterval]);

  const refresh = useCallback(() => {
    setData(prev => ({ ...prev, isLoading: true }));
    fetchAllData();
  }, [fetchAllData]);

  return { ...data, refresh };
};
