import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';

interface SolarEvent {
  name: string;
  date: string; // ISO
  description: string;
  magnitude: number; // scale 0–10 for dot size
}

const solarEvents: SolarEvent[] = [
  {
    name: 'Carrington Event',
    date: '1859-09-01',
    description: 'The most powerful geomagnetic storm in recorded history',
    magnitude: 10,
  },
  {
    name: 'March 1989 Storm',
    date: '1989-03-13',
    description: 'Caused a province-wide blackout in Quebec, Canada',
    magnitude: 8,
  },
  {
    name: 'Halloween Storms',
    date: '2003-10-29',
    description: 'Cluster of strong X-class flares & severe geomagnetic storms',
    magnitude: 7,
  },
  {
    name: 'St Patrick’s Day Storm',
    date: '2015-03-17',
    description: 'Severe G4 storm produced vivid auroras at low latitudes',
    magnitude: 6,
  },
  {
    name: 'June 2015 Series',
    date: '2015-06-22',
    description: 'Three consecutive CMEs sparked sustained geomagnetic storms',
    magnitude: 5,
  },
];

const HistoricalTimeline: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<SolarEvent | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Clear previous SVG
    ref.current.innerHTML = '';

    const margin = { top: 20, right: 20, bottom: 30, left: 20 };
    const width = ref.current.clientWidth - margin.left - margin.right;
    const height = 120;

    const svg = d3
      .select(ref.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse('%Y-%m-%d');

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(solarEvents, (d) => parseDate(d.date)!))
      .range([0, width]);

    // X axis
    const xAxis = d3
      .axisBottom<Date>(xScale)
      .ticks(5)
      .tickFormat(d3.timeFormat('%Y') as any);
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', '#94a3b8')
      .style('font-size', '10px');

    // Dots
    svg
      .selectAll('circle')
      .data(solarEvents)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(parseDate(d.date)!)!)
      .attr('cy', height / 2)
      .attr('r', (d) => 4 + d.magnitude)
      .attr('fill', '#38bdf8')
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelected(d);
      })
      .append('title')
      .text((d) => `${d.name} – ${d3.timeFormat('%d %b %Y')(parseDate(d.date)!)} `);
  }, [ref]);

  return (
    <div className="aetheria-glass p-6">
      <div className="flex items-center space-x-2 mb-4">
        <BookOpen className="h-5 w-5 text-solar-orange" />
        <h3 className="text-lg font-display font-semibold cosmic-glow">Historical Timeline</h3>
      </div>
      <div ref={ref} className="w-full" />

      {selected && (
        <div className="mt-4 aetheria-glass p-4">
          <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="h-4 w-4 text-aurora-green" />
            <h4 className="font-semibold">{selected.name}</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            {new Date(selected.date).toLocaleDateString()}
          </p>
          <p className="text-sm">{selected.description}</p>
        </div>
      )}
    </div>
  );
};

export default HistoricalTimeline;
