import { create } from 'zustand';
import type {
  AllRunMetrics,
  ConnectionStatus,
  RawPoint,
  RunInfo,
  Series,
  SSEDelta,
  SSESnapshot,
  TabKey,
  TimeRange,
} from '../types/metrics';

function rawPointsToSeries(points: RawPoint[]): Series {
  return {
    steps: points.map((p) => p[0]),
    values: points.map((p) => p[1]),
    timestamps: points.map((p) => p[2]),
  };
}

function appendSeries(existing: Series, points: RawPoint[]): Series {
  return {
    steps: [...existing.steps, ...points.map((p) => p[0])],
    values: [...existing.values, ...points.map((p) => p[1])],
    timestamps: [...existing.timestamps, ...points.map((p) => p[2])],
  };
}

interface MetricsState {
  version: number;
  runs: AllRunMetrics;
  allRuns: RunInfo[];
  selectedRuns: string[];
  timeRange: TimeRange | null;
  selectedTab: TabKey;
  connectionStatus: ConnectionStatus;
  setTab: (tab: TabKey) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  applySnapshot: (data: SSESnapshot) => void;
  applyDelta: (data: SSEDelta) => void;
  applyRunsMeta: (runs: RunInfo[]) => void;
  toggleRun: (runId: string) => void;
  selectAllRuns: () => void;
  deselectAllRuns: () => void;
  setTimeRange: (range: TimeRange | null) => void;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  version: 0,
  runs: {},
  allRuns: [],
  selectedRuns: [],
  timeRange: null,
  selectedTab: 'training',
  connectionStatus: 'connecting',

  setTab: (tab) => set({ selectedTab: tab }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  applySnapshot: (data) =>
    set((state) => {
      const runs: AllRunMetrics = {};
      for (const [runId, metrics] of Object.entries(data.runs)) {
        runs[runId] = {};
        for (const [metric, points] of Object.entries(metrics)) {
          runs[runId][metric] = rawPointsToSeries(points);
        }
      }
      const allRunIds = Object.keys(data.runs);
      // Initialize runs_meta from snapshot if present
      const allRuns = data.runs_meta ?? state.allRuns;
      // Auto-select all runs on initial snapshot
      return {
        version: data.version,
        runs,
        allRuns,
        selectedRuns: allRuns.length > 0
          ? allRuns.map((r) => r.run_id)
          : allRunIds,
      };
    }),

  applyDelta: (data) =>
    set((state) => {
      const runs = { ...state.runs };
      const selectedSet = new Set(state.selectedRuns);

      for (const [runId, metrics] of Object.entries(data.runs)) {
        // Auto-select newly appeared runs
        if (!runs[runId]) {
          selectedSet.add(runId);
        }
        if (!runs[runId]) {
          runs[runId] = {};
        } else {
          runs[runId] = { ...runs[runId] };
        }
        for (const [metric, points] of Object.entries(metrics)) {
          if (runs[runId][metric]) {
            runs[runId][metric] = appendSeries(runs[runId][metric], points);
          } else {
            runs[runId][metric] = rawPointsToSeries(points);
          }
        }
      }
      return {
        version: data.version,
        runs,
        selectedRuns: Array.from(selectedSet),
      };
    }),

  applyRunsMeta: (runsMeta) =>
    set((state) => {
      const prevIds = new Set(state.allRuns.map((r) => r.run_id));
      const selectedSet = new Set(state.selectedRuns);
      // Auto-select any brand-new runs
      for (const r of runsMeta) {
        if (!prevIds.has(r.run_id)) {
          selectedSet.add(r.run_id);
        }
      }
      return {
        allRuns: runsMeta,
        selectedRuns: Array.from(selectedSet),
      };
    }),

  toggleRun: (runId) =>
    set((state) => {
      const selected = new Set(state.selectedRuns);
      if (selected.has(runId)) {
        selected.delete(runId);
      } else {
        selected.add(runId);
      }
      return { selectedRuns: Array.from(selected) };
    }),

  selectAllRuns: () =>
    set((state) => ({
      selectedRuns: state.allRuns.map((r) => r.run_id),
    })),

  deselectAllRuns: () => set({ selectedRuns: [] }),

  setTimeRange: (range) => set({ timeRange: range }),
}));
