import MetricCard from '../charts/MetricCard';
import { useTabMetrics } from './useTabMetrics';

const SYSTEM_METRICS = [
  'sys.gpu.0.util_percent', 'sys.gpu.1.util_percent',
  'sys.cpu_percent', 'gpu_idle_time', 'cpu_idle_time',
  'sys.net.0.sent_bytes_per_s',
];

export default function SystemTab() {
  const metrics = useTabMetrics('system', SYSTEM_METRICS);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {metrics.map((m) => (
        <MetricCard key={m} metric={m} useTimestampAxis />
      ))}
      {metrics.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-12">
          No system metrics available yet
        </div>
      )}
    </div>
  );
}
