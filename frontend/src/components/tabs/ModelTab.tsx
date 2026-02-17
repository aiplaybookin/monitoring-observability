import MetricCard from '../charts/MetricCard';
import { useTabMetrics } from './useTabMetrics';

const MODEL_METRICS = [
  'null_ratio', 'gsa_attention', 'recurrence_depth', 'mhc_score',
  'moe_favourite_tokens', 'moe_fourier_weight', 'current_bucket',
];

export default function ModelTab() {
  const metrics = useTabMetrics('model', MODEL_METRICS);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {metrics.map((m) => (
        <MetricCard key={m} metric={m} />
      ))}
      {metrics.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-12">
          No model metrics available yet
        </div>
      )}
    </div>
  );
}
