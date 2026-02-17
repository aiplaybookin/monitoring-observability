/** A single data point: [step, value, timestamp] */
export type RawPoint = [number, number, number];

/** Run metadata from the backend */
export interface RunInfo {
  run_id: string;
  start_time: number;
  last_event_time: number;
  latest_step: number;
  is_active: boolean;
}

/** Time range filter */
export interface TimeRange {
  from: number;
  to: number;
}

export type TimePreset = '1h' | '6h' | '24h' | '7d' | 'all';

/** Wire format for SSE payloads */
export interface SSESnapshot {
  version: number;
  runs: Record<string, Record<string, RawPoint[]>>;
  runs_meta?: RunInfo[];
}

export interface SSEDelta {
  version: number;
  runs: Record<string, Record<string, RawPoint[]>>;
}

export interface SSERunsMeta {
  runs_meta: RunInfo[];
}

/** Internal typed-array series for efficient charting */
export interface Series {
  steps: number[];
  values: number[];
  timestamps: number[];
}

export type RunMetrics = Record<string, Series>;
export type AllRunMetrics = Record<string, RunMetrics>;

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export const TAB_KEYS = ['training', 'model', 'system', 'checkpoints', 'progress'] as const;
export type TabKey = (typeof TAB_KEYS)[number];

export const TAB_LABELS: Record<TabKey, string> = {
  training: 'Training',
  model: 'Model',
  system: 'System',
  checkpoints: 'Checkpoints',
  progress: 'Progress',
};

/** Metric prefixes for each tab */
export const TAB_METRICS: Record<TabKey, string[]> = {
  training: [
    'loss_t1', 'loss_t2', 'null_router_loss', 'moe_router_loss',
    'validation_loss', 'token_per_sec', 'batch_per_sec', 'total_tokens',
  ],
  model: [
    'null_ratio', 'gsa_', 'recurrence_', 'mhc_',
    'moe_favourite_tokens', 'moe_fourier_', 'current_bucket',
  ],
  system: [
    'sys.gpu.', 'sys.cpu_percent', 'gpu_idle_time',
    'cpu_idle_time', 'sys.net.',
  ],
  checkpoints: ['checkpoint_'],
  progress: [
    'time_to_b1', 'time_to_b2', 'time_to_3b',
    'time_to_8b', 'time_to_70b', 'time_to_sft',
  ],
};

/** Check if a metric belongs to a tab */
export function metricMatchesTab(metric: string, tab: TabKey): boolean {
  return TAB_METRICS[tab].some(
    (prefix) => metric === prefix || metric.startsWith(prefix)
  );
}
