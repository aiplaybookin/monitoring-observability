import { useMetricsStore } from '../../stores/metricsStore';

const BADGE_COLORS_SELECTED = [
  'bg-blue-900/50 text-blue-300 border-blue-700',
  'bg-green-900/50 text-green-300 border-green-700',
  'bg-amber-900/50 text-amber-300 border-amber-700',
  'bg-purple-900/50 text-purple-300 border-purple-700',
  'bg-cyan-900/50 text-cyan-300 border-cyan-700',
];

const BADGE_DESELECTED = 'bg-gray-900/30 text-gray-600 border-gray-700/50';

export default function RunBadges() {
  const allRuns = useMetricsStore((s) => s.allRuns);
  const selectedRuns = useMetricsStore((s) => s.selectedRuns);
  const toggleRun = useMetricsStore((s) => s.toggleRun);
  const selectAllRuns = useMetricsStore((s) => s.selectAllRuns);
  const deselectAllRuns = useMetricsStore((s) => s.deselectAllRuns);

  if (allRuns.length === 0) return null;

  const selectedSet = new Set(selectedRuns);

  return (
    <div className="flex items-center gap-2 px-6 py-2 border-b border-gray-800 bg-gray-950/50 flex-wrap">
      <span className="text-xs text-gray-500 mr-1">Runs:</span>
      <button
        onClick={selectAllRuns}
        className="text-[10px] text-gray-400 hover:text-white px-1.5 py-0.5 rounded border border-gray-700 hover:border-gray-500 transition-colors"
      >
        All
      </button>
      <button
        onClick={deselectAllRuns}
        className="text-[10px] text-gray-400 hover:text-white px-1.5 py-0.5 rounded border border-gray-700 hover:border-gray-500 transition-colors"
      >
        None
      </button>
      {allRuns.map((run, i) => {
        const isSelected = selectedSet.has(run.run_id);
        const colorClass = isSelected
          ? BADGE_COLORS_SELECTED[i % BADGE_COLORS_SELECTED.length]
          : BADGE_DESELECTED;
        const label = run.run_id.length > 12 ? run.run_id.slice(0, 12) + '...' : run.run_id;
        const tooltip = [
          run.run_id,
          run.is_active ? 'Active' : 'Inactive',
          `Last event: ${new Date(run.last_event_time * 1000).toLocaleString()}`,
          `Step: ${run.latest_step.toLocaleString()}`,
        ].join('\n');

        return (
          <button
            key={run.run_id}
            onClick={() => toggleRun(run.run_id)}
            title={tooltip}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border cursor-pointer transition-all ${colorClass}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                run.is_active ? 'bg-green-400' : 'bg-gray-500'
              }`}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}
