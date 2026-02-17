import { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
];

interface SeriesData {
  label: string;
  steps: number[];
  values: number[];
  timestamps?: number[];
}

interface TimeSeriesChartProps {
  series: SeriesData[];
  title?: string;
  yAxisLabel?: string;
  width?: number;
  height?: number;
  useTimestampAxis?: boolean;
}

export default function TimeSeriesChart({
  series,
  title,
  yAxisLabel,
  width,
  height = 200,
  useTimestampAxis = false,
}: TimeSeriesChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<uPlot | null>(null);

  useEffect(() => {
    if (!containerRef.current || series.length === 0) return;

    const el = containerRef.current;
    const w = width ?? el.clientWidth;

    // Build aligned data: [xValues, ...yValues]
    // Use timestamps or steps as x-axis depending on mode
    const xKey = useTimestampAxis ? 'timestamps' : 'steps';
    const allX = new Set<number>();
    for (const s of series) {
      const xArr = useTimestampAxis ? (s.timestamps ?? s.steps) : s.steps;
      for (const x of xArr) allX.add(x);
    }
    const sortedX = Array.from(allX).sort((a, b) => a - b);

    const data: (number | null)[][] = [sortedX];
    for (const s of series) {
      const xArr = useTimestampAxis ? (s.timestamps ?? s.steps) : s.steps;
      const xMap = new Map<number, number>();
      for (let i = 0; i < xArr.length; i++) {
        xMap.set(xArr[i], s.values[i]);
      }
      data.push(sortedX.map((x) => xMap.get(x) ?? null));
    }

    const opts: uPlot.Options = {
      width: w,
      height,
      title,
      cursor: { show: true, drag: { x: true, y: false } },
      scales: {
        x: { time: useTimestampAxis },
      },
      axes: [
        {
          label: useTimestampAxis ? undefined : 'Step',
          stroke: '#9ca3af',
          grid: { stroke: '#1f2937', width: 1 },
          ticks: { stroke: '#374151', width: 1 },
        },
        {
          label: yAxisLabel,
          stroke: '#9ca3af',
          grid: { stroke: '#1f2937', width: 1 },
          ticks: { stroke: '#374151', width: 1 },
        },
      ],
      series: [
        {},
        ...series.map((s, i) => ({
          label: s.label,
          stroke: COLORS[i % COLORS.length],
          width: 2,
        })),
      ],
    };

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new uPlot(opts, data as uPlot.AlignedData, el);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [series, title, yAxisLabel, width, height, useTimestampAxis]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (chartRef.current) {
          chartRef.current.setSize({
            width: entry.contentRect.width,
            height,
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [height]);

  return <div ref={containerRef} className="w-full" />;
}
