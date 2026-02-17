import { useMemo } from 'react';
import { useMetricsStore } from '../../stores/metricsStore';
import { metricMatchesTab, type TabKey } from '../../types/metrics';

/**
 * Finds all metric names from selected runs that match a tab.
 * Falls back to known metric names if no data yet.
 */
export function useTabMetrics(tab: TabKey, knownMetrics: string[]): string[] {
  const runs = useMetricsStore((s) => s.runs);
  const selectedRuns = useMetricsStore((s) => s.selectedRuns);

  return useMemo(() => {
    const found = new Set<string>();
    for (const runId of selectedRuns) {
      const runData = runs[runId];
      if (!runData) continue;
      for (const metric of Object.keys(runData)) {
        if (metricMatchesTab(metric, tab)) {
          found.add(metric);
        }
      }
    }
    // If we found metrics from live data, use those; otherwise show known ones
    if (found.size > 0) {
      return Array.from(found).sort();
    }
    // Only show known metrics that exist in any run
    return knownMetrics.filter((m) => {
      for (const runId of selectedRuns) {
        if (runs[runId]?.[m]) return true;
      }
      return false;
    });
  }, [runs, selectedRuns, tab, knownMetrics]);
}
