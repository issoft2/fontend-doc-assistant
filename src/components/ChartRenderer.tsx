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
  type ChartType,
  type Plugin,
  type TooltipItem,
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

// ─── Palette ──────────────────────────────────────────────────────────────────

const PALETTE = [
  '#6366F1', '#22C55E', '#F97316', '#06B6D4',
  '#EC4899', '#EAB308', '#8B5CF6', '#14B8A6',
];

// ─── Gradient plugin ──────────────────────────────────────────────────────────
// Typed as Plugin<ChartType> (the widest type) so it's assignable to both
// Plugin<'line'> and Plugin<'bar'> without conflict.

type GradientDataset = {
  _useGradient?: boolean;
  _baseColor?: string;
  backgroundColor?: unknown;
};

const gradientPlugin: Plugin<ChartType> = {
  id: 'areaGradient',
  afterLayout(chart) {
    const { ctx, chartArea, data } = chart;
    if (!chartArea) return;

    data.datasets.forEach((dataset, i) => {
      const ds = dataset as GradientDataset;
      if (!ds._useGradient || !ds._baseColor) return;
      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      gradient.addColorStop(0, `${ds._baseColor}55`);
      gradient.addColorStop(1, `${ds._baseColor}00`);
      (data.datasets[i] as GradientDataset).backgroundColor = gradient;
    });
  },
};

// ─── Options builder ──────────────────────────────────────────────────────────

function buildOptions(spec: ChartSpec): ChartOptions<'line'> & ChartOptions<'bar'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400, easing: 'easeInOutQuart' },
    plugins: {
      title: { display: false },
      legend: {
        display: spec.y_fields.length > 1,
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          color: '#cbd5e1',
          font: { size: 11 },
          boxWidth: 10,
          boxHeight: 10,
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle' as const,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        padding: 10,
        callbacks: {
          // Explicitly type ctx as TooltipItem<ChartType> — widest compatible type
          label(ctx: TooltipItem<ChartType>) {
            const raw = ctx.parsed.y as number | undefined;
            const formatted =
              typeof raw === 'number'
                ? raw.toLocaleString(undefined, { maximumFractionDigits: 2 })
                : String(raw ?? '');
            return ` ${ctx.dataset.label ?? ''}: ${formatted}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', maxRotation: 45, minRotation: 0, font: { size: 11 } },
        title: { display: !!spec.x_label, text: spec.x_label, color: '#475569', font: { size: 11 } },
        grid: { color: '#1e293b' },
        border: { color: '#1e293b' },
      },
      y: {
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          callback(value: number | string) {
            const n = Number(value);
            if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
            if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
            return n.toLocaleString();
          },
        },
        title: { display: !!spec.y_label, text: spec.y_label, color: '#475569', font: { size: 11 } },
        grid: { color: '#1e293b' },
        border: { color: '#1e293b' },
      },
    },
  } as ChartOptions<'line'> & ChartOptions<'bar'>;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ChartRenderer: React.FC<ChartRendererProps> = ({ spec, className = '' }) => {
  const chartRef = useRef<ChartJS | null>(null);

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
          backgroundColor: `${baseColor}99`,
          borderColor: baseColor,
          borderWidth: 1.5,
          borderRadius: 4,
          borderSkipped: false as const,
        };
      }

      return {
        label: field,
        data: values,
        borderColor: baseColor,
        borderWidth: 2,
        pointRadius: values.length > 30 ? 0 : 3,
        pointHoverRadius: 5,
        pointBackgroundColor: baseColor,
        backgroundColor: 'transparent',
        fill: spec.chart_type === 'area',
        tension: 0.3,
        _useGradient: spec.chart_type === 'area',
        _baseColor: baseColor,
      };
    });
  }, [spec.y_fields, spec.data, spec.chart_type]);

  const chartData = useMemo(() => ({ labels, datasets }), [labels, datasets]);
  const chartOptions = useMemo(() => buildOptions(spec), [spec]);

  const containerHeight = useMemo(() => {
    const n = spec.data.length;
    if (n > 24) return 'h-80 md:h-96';
    if (n > 12) return 'h-64 md:h-80';
    return 'h-56 md:h-72';
  }, [spec.data.length]);

  const plugins = useMemo(
    () => spec.chart_type === 'area' ? [gradientPlugin] : [],
    [spec.chart_type],
  );

  const ChartComponent = spec.chart_type === 'bar' ? Bar : Line;

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      {spec.title && (
        <p className="text-xs font-semibold text-slate-400 tracking-wide">{spec.title}</p>
      )}
      <div className={`${containerHeight} w-full`}>
        <ChartComponent
          ref={chartRef as any}
          data={chartData as any}
          options={chartOptions as any}
          plugins={plugins as any}
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