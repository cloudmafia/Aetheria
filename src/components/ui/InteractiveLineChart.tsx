import React from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';

const Plot = createPlotlyComponent(Plotly);

// Generic interactive line chart component using Plotly.js
// Accepts an array of data objects and line definitions
// Example:
// data = [{ time: '12:00', 'Proton Flux': 10, 'Electron Flux': 5 }, ...]
// lines = [{ key: 'Proton Flux', color: '#ff6b6b' }, ...]
interface LineDefinition {
  key: string;
  color: string;
}

interface InteractiveLineChartProps {
  data: Record<string, any>[]; // generic object array
  lines: LineDefinition[];
  height?: number | string;
  unit?: string;
}

const InteractiveLineChart: React.FC<InteractiveLineChartProps> = ({
  data,
  lines,
  height = '100%',
  unit,
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  // X-axis values – assume first object's `time` field exists
  const x = data.map((d) => d.time);

  const traces = lines.map((line) => ({
    x,
    y: data.map((d) => d[line.key]),
    type: 'scatter',
    mode: 'lines',
    name: line.key,
    line: { color: line.color, width: 2 },
    hovertemplate: `%{y}${unit ? ` ${unit}` : ''}<extra>${line.key}</extra>`,
  }));

  const layout: Partial<Plotly.Layout> = {
    autosize: true,
    margin: { l: 40, r: 20, t: 10, b: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#e5e7eb', size: 12 }, // tailwind zinc-200-esque
    xaxis: {
      title: 'Time',
      gridcolor: 'rgba(255,255,255,0.1)',
      tickfont: { size: 10 },
    },
    yaxis: {
      gridcolor: 'rgba(255,255,255,0.1)',
      tickfont: { size: 10 },
    },
    showlegend: lines.length > 1,
  };

  const config: Partial<Plotly.Config> = {
    displayModeBar: false,
    responsive: true,
  };

  return (
    <Plot
      data={traces as any}
      layout={layout}
      config={config}
      style={{ width: '100%', height }}
      useResizeHandler
    />
  );
};

export default InteractiveLineChart;
