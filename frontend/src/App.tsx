import { useSSE } from './hooks/useSSE';
import { useMetricsStore } from './stores/metricsStore';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import RunBadges from './components/layout/RunBadges';
import TrainingTab from './components/tabs/TrainingTab';
import ModelTab from './components/tabs/ModelTab';
import SystemTab from './components/tabs/SystemTab';
import CheckpointsTab from './components/tabs/CheckpointsTab';
import ProgressTab from './components/tabs/ProgressTab';
import type { TabKey } from './types/metrics';

const TAB_COMPONENTS: Record<TabKey, React.ComponentType> = {
  training: TrainingTab,
  model: ModelTab,
  system: SystemTab,
  checkpoints: CheckpointsTab,
  progress: ProgressTab,
};

export default function App() {
  useSSE();
  const selectedTab = useMetricsStore((s) => s.selectedTab);
  const TabContent = TAB_COMPONENTS[selectedTab];

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <RunBadges />
          <main className="flex-1 overflow-auto p-6">
            <TabContent />
          </main>
        </div>
      </div>
    </div>
  );
}
