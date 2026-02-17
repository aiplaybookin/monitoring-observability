import { useMetricsStore } from '../../stores/metricsStore';
import { TAB_KEYS, TAB_LABELS, type TabKey } from '../../types/metrics';

const TAB_ICONS: Record<TabKey, string> = {
  training: 'TRN',
  model: 'MDL',
  system: 'SYS',
  checkpoints: 'CKP',
  progress: 'PRG',
};

export default function Sidebar() {
  const selectedTab = useMetricsStore((s) => s.selectedTab);
  const setTab = useMetricsStore((s) => s.setTab);

  return (
    <nav className="w-48 border-r border-gray-800 bg-gray-950 p-3 shrink-0">
      <div className="space-y-1">
        {TAB_KEYS.map((tab) => (
          <button
            key={tab}
            onClick={() => setTab(tab)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedTab === tab
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <span className="text-[10px] font-mono opacity-60 w-6">{TAB_ICONS[tab]}</span>
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>
    </nav>
  );
}
