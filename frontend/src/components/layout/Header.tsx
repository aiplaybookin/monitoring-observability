import { useMetricsStore } from '../../stores/metricsStore';
import type { ConnectionStatus, TimePreset } from '../../types/metrics';

const STATUS_CONFIG: Record<ConnectionStatus, { color: string; label: string }> = {
  connected: { color: 'bg-green-500', label: 'Connected' },
  connecting: { color: 'bg-yellow-500', label: 'Connecting...' },
  disconnected: { color: 'bg-red-500', label: 'Disconnected' },
};

const TIME_PRESETS: { key: TimePreset; label: string; seconds: number | null }[] = [
  { key: '1h', label: '1h', seconds: 3600 },
  { key: '6h', label: '6h', seconds: 21600 },
  { key: '24h', label: '24h', seconds: 86400 },
  { key: '7d', label: '7d', seconds: 604800 },
  { key: 'all', label: 'All', seconds: null },
];

export default function Header() {
  const status = useMetricsStore((s) => s.connectionStatus);
  const version = useMetricsStore((s) => s.version);
  const timeRange = useMetricsStore((s) => s.timeRange);
  const setTimeRange = useMetricsStore((s) => s.setTimeRange);
  const cfg = STATUS_CONFIG[status];

  // Determine which preset is active
  const activePreset: TimePreset | null = timeRange === null ? 'all' : null;

  function handlePreset(preset: typeof TIME_PRESETS[number]) {
    if (preset.seconds === null) {
      setTimeRange(null);
    } else {
      const now = Date.now() / 1000;
      setTimeRange({ from: now - preset.seconds, to: now });
    }
  }

  return (
    <header className="h-14 border-b border-gray-800 bg-gray-950 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-white">Training Metrics</h1>
        <span className="text-xs text-gray-500 font-mono">v{version}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {TIME_PRESETS.map((preset) => {
            const isActive =
              preset.key === 'all'
                ? activePreset === 'all'
                : timeRange !== null &&
                  Math.abs((timeRange.to - timeRange.from) - (preset.seconds ?? 0)) < 60;
            return (
              <button
                key={preset.key}
                onClick={() => handlePreset(preset)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
          <span className="text-xs text-gray-400">{cfg.label}</span>
        </div>
      </div>
    </header>
  );
}
