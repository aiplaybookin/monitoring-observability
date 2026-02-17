import { useMetricsStore } from '../../stores/metricsStore';

const MILESTONES = [
  { key: 'time_to_b1', label: 'Batch 1' },
  { key: 'time_to_b2', label: 'Batch 2' },
  { key: 'time_to_3b', label: '3B Tokens' },
  { key: 'time_to_8b', label: '8B Tokens' },
  { key: 'time_to_70b', label: '70B Tokens' },
  { key: 'time_to_sft', label: 'SFT Ready' },
];

export default function ProgressTab() {
  const runs = useMetricsStore((s) => s.runs);
  const selectedRuns = useMetricsStore((s) => s.selectedRuns);

  return (
    <div className="space-y-6">
      {selectedRuns.length === 0 && (
        <div className="text-center text-gray-500 py-12">No active runs</div>
      )}
      {selectedRuns.map((runId) => {
        const runData = runs[runId];
        if (!runData) return null;

        return (
          <div key={runId} className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <h3 className="text-sm font-mono text-blue-400 mb-4">
              {runId.length > 20 ? runId.slice(0, 20) + '...' : runId}
            </h3>
            <div className="space-y-3">
              {MILESTONES.map(({ key, label }) => {
                const series = runData[key];
                const latestValue = series
                  ? series.values[series.values.length - 1]
                  : null;
                const reached = latestValue !== null && latestValue > 0;

                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-gray-400 shrink-0">{label}</div>
                    <div className="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden">
                      {reached ? (
                        <div
                          className="h-full bg-green-600 rounded-full flex items-center justify-end pr-2 transition-all"
                          style={{ width: '100%' }}
                        >
                          <span className="text-[10px] font-mono text-white">
                            {formatDuration(latestValue!)}
                          </span>
                        </div>
                      ) : latestValue !== null ? (
                        <div
                          className="h-full bg-blue-600/50 rounded-full transition-all"
                          style={{ width: `${Math.min(Math.abs(latestValue) * 100, 95)}%` }}
                        />
                      ) : (
                        <div className="h-full flex items-center pl-3">
                          <span className="text-[10px] text-gray-600">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}
