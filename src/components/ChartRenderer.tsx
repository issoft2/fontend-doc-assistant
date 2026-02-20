import React, { useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  type ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import MarkdownText from './MarkdownText';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChartDataRow {
  [key: string]: number | string;
}

export interface ChartSpec {
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

// ─── Palette — extended to 8 colors so 4+ series never duplicate ──────────────

const PALETTE = [
  '#6366F1', // indigo
  '#22C55E', // green
  '#F97316', // orange
  '#06B6D4', // cyan
  '#EC4899', // pink
  '#EAB308', // yellow
  '#8B5CF6', // violet
  '#14B8A6', // teal
];

// ─── Gradient fill helper for area charts ─────────────────────────────────────

function makeGradient(
  ctx: CanvasRenderingContext2D,
  chartArea: { top: number; bottom: number },
  hexColor: string,
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, `${hexColor}55`);   // ~33% opacity at top
  gradient.addColorStop(1, `${hexColor}00`);   // fully transparent at bottom
  return gradient;
}

// ─── Shared dark-theme chart options ─────────────────────────────────────────

function buildOptions(spec: ChartSpec): ChartOptions<'line'> | ChartOptions<'bar'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400, easing: 'easeInOutQuart' },
    plugins: {
      // Title intentionally disabled — the parent ChartsSection already labels the block.
      // Enable here only if ChartRenderer is used standalone outside that wrapper.
      title: { display: false },
      legend: {
        display: spec.y_fields.length > 1, // hide legend when there's only one series
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          color: '#cbd5e1',       // slate-300 — was typo '#cbd5f5'
          font: { size: 11 },
          boxWidth: 10,
          boxHeight: 10,
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',  // slate-950
        borderColor: '#334155',      // slate-700
        borderWidth: 1,
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        padding: 10,
        callbacks: {
          // Format numbers with locale separators: 1234567 → 1,234,567
          label: (ctx) => {
            const raw = ctx.parsed.y;
            const formatted =
              typeof raw === 'number'
                ? raw.toLocaleString(undefined, { maximumFractionDigits: 2 })
                : raw;
            return ` ${ctx.dataset.label}: ${formatted}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#64748b',     // slate-500
          maxRotation: 45,
          minRotation: 0,
          font: { size: 11 },
        },
        title: {
          display: !!spec.x_label,
          text: spec.x_label,
          color: '#475569',     // slate-600
          font: { size: 11 },
        },
        grid: { color: '#1e293b' },  // slate-800
        border: { color: '#1e293b' },
      },
      y: {
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          // Compact large numbers on the y-axis: 1,200,000 → 1.2M
          callback: (value) => {
            const n = Number(value);
            if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
            if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
            return n.toLocaleString();
          },
        },
        title: {
          display: !!spec.y_label,
          text: spec.y_label,
          color: '#475569',
          font: { size: 11 },
        },
        grid: { color: '#1e293b' },
        border: { color: '#1e293b' },
      },
    },
  } as ChartOptions<'line'> | ChartOptions<'bar'>;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ChartRenderer: React.FC<ChartRendererProps> = ({ spec, className = '' }) => {
  const chartRef = useRef<ChartJS<'line'> | null>(null);

  const labels = useMemo(
    () => spec.data.map((row) => String(row[spec.x_field] ?? '')),
    [spec.data, spec.x_field],
  );

  const datasets = useMemo(() => {
    return spec.y_fields.map((field, idx) => {
      const baseColor = PALETTE[idx % PALETTE.length];
      const values = spec.data.map((row) => Number(row[field] ?? 0));

      if (spec.chart_type === 'bar') {
        return {
          label: field,
          data: values,
          backgroundColor: `${baseColor}99`,  // ~60% opacity
          borderColor: baseColor,
          borderWidth: 1.5,
          borderRadius: 4,
          borderSkipped: false as const,
        };
      }

      // line / area
      return {
        label: field,
        data: values,
        borderColor: baseColor,
        borderWidth: 2,
        pointRadius: values.length > 30 ? 0 : 3,  // hide dots for dense data
        pointHoverRadius: 5,
        pointBackgroundColor: baseColor,
        // For area: use a canvas gradient (computed at render time via the plugin below).
        // For line: fully transparent fill.
        backgroundColor: spec.chart_type === 'area'
          ? (context: { chart: ChartJS }) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) return 'transparent';
              return makeGradient(ctx, chartArea, baseColor);
            }
          : 'transparent',
        fill: spec.chart_type === 'area',
        tension: 0.3,
      };
    });
  }, [spec.y_fields, spec.data, spec.chart_type]);

  const chartData = useMemo(
    () => ({ labels, datasets }),
    [labels, datasets],
  );

  const chartOptions = useMemo(() => buildOptions(spec), [spec]);

  // Adjust container height based on label density to avoid clipping
  const containerHeight = useMemo(() => {
    const rowCount = spec.data.length;
    if (rowCount > 24) return 'h-80 md:h-96';
    if (rowCount > 12) return 'h-64 md:h-80';
    return 'h-56 md:h-72';
  }, [spec.data.length]);

  const ChartComponent = spec.chart_type === 'bar' ? Bar : Line;

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      {/* Chart title — shown here only if used outside ChartsSection */}
      {spec.title && (
        <p className="text-xs font-semibold text-slate-400 tracking-wide">{spec.title}</p>
      )}

      <div className={`${containerHeight} w-full`}>
        <ChartComponent
          ref={chartRef as any}
          data={chartData as any}
          options={chartOptions as any}
        />
      </div>

      {spec.caption && (
        <MarkdownText
          content={spec.caption}
          className="answer-content text-xs text-slate-500 leading-relaxed"
        />
      )}
    </div>
  );
};

ChartRenderer.displayName = 'ChartRenderer';

export default ChartRenderer;
