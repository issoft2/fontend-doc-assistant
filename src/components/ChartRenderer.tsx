'use client';

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from 'chart.js';
import {
  Line,
  Bar,
} from 'react-chartjs-2';
import MarkdownText from './MarkdownText';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler, // For area charts
);

interface ChartDataRow {
  [key: string]: number | string;
}

interface ChartSpec {
  chart_type: 'line' | 'bar' | 'area';
  title: string;
  x_field: string;
  x_label: string;
  y_fields: string[];
  y_label: string;
  data: ChartDataRow[];
  caption?: string;
}

interface ChartRendererProps {
  spec: ChartSpec;
  className?: string;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ spec, className = '' }) => {
  // Memoized labels computation
  const labels = useMemo(
    () => spec.data.map(row => String(row[spec.x_field] ?? '')),
    [spec.data, spec.x_field]
  );

  // Memoized datasets computation
  const datasets = useMemo(() => {
    const palette = ['#6366F1', '#22C55E', '#F97316']; // indigo, emerald, orange
    
    return spec.y_fields.map((field, idx) => {
      const baseColor = palette[idx % palette.length];
      const data = spec.data.map(row => Number(row[field] ?? 0));

      return {
        label: field,
        data,
        borderColor: baseColor,
        backgroundColor: spec.chart_type === 'bar' 
          ? `${baseColor}55` 
          : 'transparent',
        fill: spec.chart_type === 'area',
        tension: 0.25,
      };
    });
  }, [spec.y_fields, spec.data, spec.chart_type]);

  // Memoized chart data
  const chartData = useMemo(() => ({
    labels,
    datasets,
  }), [labels, datasets]);

  // Memoized chart options
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        labels: { 
          color: '#cbd5f5', 
          font: { size: 10 } 
        } 
      },
      title: {
        display: !!spec.title,
        text: spec.title,
        color: '#e5e7eb',
        font: { size: 12, weight: '600' as const },
      },
    },
    scales: {
      x: {
        ticks: { 
          color: '#9ca3af', 
          maxRotation: 45, 
          minRotation: 0 
        },
        title: {
          display: !!spec.x_label,
          text: spec.x_label,
          color: '#9ca3af',
        },
        grid: { color: '#1f2937' },
      },
      y: {
        ticks: { color: '#9ca3af' },
        title: {
          display: !!spec.y_label,
          text: spec.y_label,
          color: '#9ca3af',
        },
        grid: { color: '#1f2937' },
      },
    },
  }), [spec.title, spec.x_label, spec.y_label]);

  // Determine chart component based on type
  const ChartComponent = spec.chart_type === 'bar' ? Bar : Line;

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      <div className="h-64 md:h-72 lg:h-80 w-full">
        <ChartComponent 
          data={chartData} 
          options={chartOptions}
          type={spec.chart_type}
        />
      </div>
      
      {spec.caption && (
        <MarkdownText
          content={spec.caption}
          className="answer-content text-xs text-slate-300"
        />
      )}
    </div>
  );
};

ChartRenderer.displayName = 'ChartRenderer';

export type { ChartSpec };
export default ChartRenderer;
