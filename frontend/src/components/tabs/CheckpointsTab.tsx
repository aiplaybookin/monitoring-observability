import { useMetricsStore } from '../../stores/metricsStore';

export default function CheckpointsTab() {
  const runs = useMetricsStore((s) => s.runs);
  const selectedRuns = useMetricsStore((s) => s.selectedRuns);

  // Collect checkpoint metrics across all runs
  const checkpoints: { runId: string; metric: string; step: number; value: number; timestamp: number }[] = [];

  for (const runId of selectedRuns) {
    const runData = runs[runId];
    if (!runData) continue;
    for (const [metric, series] of Object.entries(runData)) {
      if (!metric.startsWith('checkpoint_')) continue;
      for (let i = 0; i < series.steps.length; i++) {
        checkpoints.push({
          runId,
          metric,
          step: series.steps[i],
          value: series.values[i],
          timestamp: series.timestamps[i],
        });
      }
    }
  }

  checkpoints.sort((a, b) => b.step - a.step);

  return (
    <div>
      {checkpoints.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No checkpoint data available yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase border-b border-gray-800">
              <tr>
                <th className="px-4 py-3">Run</th>
                <th className="px-4 py-3">Metric</th>
                <th className="px-4 py-3">Step</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {checkpoints.map((cp, i) => (
                <tr key={i} className="hover:bg-gray-900/50">
                  <td className="px-4 py-2 font-mono text-xs text-blue-400">
                    {cp.runId.slice(0, 12)}
                  </td>
                  <td className="px-4 py-2 text-gray-300">{cp.metric}</td>
                  <td className="px-4 py-2 font-mono">{cp.step.toLocaleString()}</td>
                  <td className="px-4 py-2 font-mono">{cp.value.toFixed(4)}</td>
                  <td className="px-4 py-2 text-gray-500 text-xs">
                    {new Date(cp.timestamp * 1000).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
