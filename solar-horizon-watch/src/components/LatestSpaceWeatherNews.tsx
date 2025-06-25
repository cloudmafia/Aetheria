import React, { useState, useEffect } from 'react';
import Newspaper from 'lucide-react/dist/esm/icons/newspaper';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Sun from 'lucide-react/dist/esm/icons/sun';
import Zap from 'lucide-react/dist/esm/icons/zap';
import Activity from 'lucide-react/dist/esm/icons/activity';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import BarChart2 from 'lucide-react/dist/esm/icons/bar-chart-2';

interface NewsItem {
  title: string;
  summary: string;
  icon: 'sun' | 'zap' | 'activity' | 'alert' | 'chart';
  severity: 'critical' | 'moderate' | 'info';
  date: string;
}

const LatestSpaceWeatherNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call to our backend
      // For now, we'll use sample data as a placeholder
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Sample news data (in a real implementation, this would come from an API)
      const sampleNews: NewsItem[] = [
        {
          title: 'X1.2 Solar Flare Detected',
          summary: 'Major solar flare erupted from sunspot region AR3664 at 15:42 UTC. Potential radio blackouts expected on Earth\'s daylight side.',
          icon: 'sun',
          severity: 'critical',
          date: new Date().toISOString()
        },
        {
          title: 'G3 Geomagnetic Storm Forecast',
          summary: 'NOAA forecasters predict G3-class geomagnetic storm to arrive on June 24-25 following multiple Earth-directed CMEs.',
          icon: 'activity',
          severity: 'moderate',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          title: 'Multiple CMEs En Route to Earth',
          summary: 'Three coronal mass ejections launched in past 48 hours are being tracked by SOHO/LASCO. Estimated time of arrival: June 24.',
          icon: 'zap',
          severity: 'moderate',
          date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
        },
        {
          title: 'R3 Radio Blackout Reported',
          summary: 'R3 (Strong) radio blackout observed at 09:15 UTC affecting HF communications across Asia and Australia. Conditions stabilizing.',
          icon: 'alert',
          severity: 'info',
          date: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString() // 14 hours ago
        },
        {
          title: 'Solar Cycle 25 Analysis Update',
          summary: 'Latest solar cycle progression data shows Cycle 25 exceeding predictions by 15%. Peak activity now expected mid-2025.',
          icon: 'chart',
          severity: 'info',
          date: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString() // 32 hours ago
        }
      ];
      
      setNews(sampleNews);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to fetch space weather news");
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(fetchNews, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffMins < 24 * 60) {
      return `${Math.floor(diffMins / 60)} hrs ago`;
    } else {
      return `${Math.floor(diffMins / (60 * 24))} days ago`;
    }
  };

  return (
    <div className="aetheria-glass p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Newspaper className="h-5 w-5 text-cosmic-blue" />
          <h3 className="text-lg font-semibold">Latest Space Weather News</h3>
        </div>
        
        <button 
          onClick={fetchNews}
          className="text-xs flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-solar-red/10 border border-solar-red/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-solar-red mt-0.5" />
            <div>
              <p className="text-sm text-solar-red font-medium">{error}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Please try again later or check your connection
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {news.map((item, index) => {
          // Get appropriate icon based on type
          const getIcon = () => {
            switch(item.icon) {
              case 'sun': return <Sun className={`h-5 w-5 ${item.severity === 'critical' ? 'text-solar-red' : item.severity === 'moderate' ? 'text-solar-orange' : 'text-cosmic-blue'}`} />;
              case 'zap': return <Zap className={`h-5 w-5 ${item.severity === 'critical' ? 'text-solar-red' : item.severity === 'moderate' ? 'text-solar-orange' : 'text-cosmic-blue'}`} />;
              case 'activity': return <Activity className={`h-5 w-5 ${item.severity === 'critical' ? 'text-solar-red' : item.severity === 'moderate' ? 'text-solar-orange' : 'text-cosmic-blue'}`} />;
              case 'alert': return <AlertTriangle className={`h-5 w-5 ${item.severity === 'critical' ? 'text-solar-red' : item.severity === 'moderate' ? 'text-solar-orange' : 'text-cosmic-blue'}`} />;
              case 'chart': return <BarChart2 className={`h-5 w-5 ${item.severity === 'critical' ? 'text-solar-red' : item.severity === 'moderate' ? 'text-solar-orange' : 'text-cosmic-blue'}`} />;
              default: return <Newspaper className={`h-5 w-5 ${item.severity === 'critical' ? 'text-solar-red' : item.severity === 'moderate' ? 'text-solar-orange' : 'text-cosmic-blue'}`} />;
            }
          };
          
          return (
            <div 
              key={index}
              className={`block p-3 rounded-lg transition-colors border ${item.severity === 'critical' ? 'border-solar-red/20 bg-solar-red/5' : item.severity === 'moderate' ? 'border-solar-orange/20 bg-solar-orange/5' : 'border-white/10 bg-white/5'}`} 
              onClick={() => {/* Open modal with more details in future implementation */}}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-1">{getIcon()}</div>
                <div className="flex-1">
                  <h4 className={`text-sm font-medium ${item.severity === 'critical' ? 'text-solar-red' : item.severity === 'moderate' ? 'text-solar-orange' : 'text-foreground'}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">{item.summary}</p>
                  <div className="flex justify-end mt-2 text-xs">
                    <span className="text-muted-foreground">{formatTimeAgo(item.date)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {loading && news.length === 0 && (
        <div className="text-center py-8">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-muted-foreground rounded-full mb-2"></div>
          <p className="text-muted-foreground text-sm">Loading news...</p>
        </div>
      )}
      
      {!loading && news.length === 0 && !error && (
        <div className="text-center py-8">
          <Newspaper className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No news available</p>
        </div>
      )}
      
      {lastUpdated && (
        <div className="text-xs text-muted-foreground text-center mt-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default LatestSpaceWeatherNews;
