import MetricCard from '../charts/MetricCard';
import { useTabMetrics } from './useTabMetrics';

const TRAINING_METRICS = [
  'loss_t1', 'loss_t2', 'null_router_loss', 'moe_router_loss',
  'validation_loss', 'token_per_sec', 'batch_per_sec', 'total_tokens',
];

export default function TrainingTab() {
  const metrics = useTabMetrics('training', TRAINING_METRICS);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {metrics.map((m) => (
        <MetricCard key={m} metric={m} />
      ))}
      {metrics.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-12">
          No training metrics available yet
        </div>
      )}
    </div>
  );
}
