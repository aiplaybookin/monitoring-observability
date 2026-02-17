import { useMemo } from 'react';
import { useMetricsStore } from '../../stores/metricsStore';
import TimeSeriesChart from './TimeSeriesChart';

interface MetricCardProps {
  metric: string;
  title?: string;
  yAxisLabel?: string;
  useTimestampAxis?: boolean;
}

export default function MetricCard({ metric, title, yAxisLabel, useTimestampAxis }: MetricCardProps) {
  const runs = useMetricsStore((s) => s.runs);
  const selectedRuns = useMetricsStore((s) => s.selectedRuns);
  const timeRange = useMetricsStore((s) => s.timeRange);

  const seriesData = useMemo(() => {
    return selectedRuns
      .filter((runId) => runs[runId]?.[metric])
      .map((runId) => {
        const series = runs[runId][metric];
        let steps = series.steps;
        let values = series.values;

        let timestamps = series.timestamps;

        // Apply time range filter if set
        if (timeRange) {
          const indices: number[] = [];
          for (let i = 0; i < series.timestamps.length; i++) {
            if (series.timestamps[i] >= timeRange.from && series.timestamps[i] <= timeRange.to) {
              indices.push(i);
            }
          }
          steps = indices.map((i) => series.steps[i]);
          values = indices.map((i) => series.values[i]);
          timestamps = indices.map((i) => series.timestamps[i]);
        }

        return {
          label: selectedRuns.length > 1 ? `${metric} (${runId.slice(0, 8)})` : metric,
          steps,
          values,
          timestamps,
        };
      })
      .filter((s) => s.steps.length > 0);
  }, [runs, selectedRuns, timeRange, metric]);

  const latestValue = seriesData.length > 0
    ? seriesData[0].values[seriesData[0].values.length - 1]
    : null;

  const displayTitle = title ?? metric.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-300 truncate">{displayTitle}</h3>
        {latestValue !== null && (
          <span className="text-lg font-mono font-bold text-white ml-2 shrink-0">
            {formatValue(latestValue)}
          </span>
        )}
      </div>
      {seriesData.length > 0 ? (
        <TimeSeriesChart series={seriesData} yAxisLabel={yAxisLabel} height={180} useTimestampAxis={useTimestampAxis} />
      ) : (
        <div className="h-[180px] flex items-center justify-center text-gray-600 text-sm">
          No data
        </div>
      )}
    </div>
  );
}

function formatValue(v: number): string {
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(v) >= 1_000) return (v / 1_000).toFixed(2) + 'K';
  if (Math.abs(v) < 0.001 && v !== 0) return v.toExponential(3);
  return v.toFixed(4);
}
