Assume there is clickhouse database with table:

CREATE TABLE IF NOT EXISTS training_observability.metric_points
(
`event_time` DateTime64(3) DEFAULT now64(3),
`run_id` LowCardinality(String),
`host` LowCardinality(String) DEFAULT '',
`rank` UInt32 DEFAULT 0,
`device` UInt16 DEFAULT 65535,
`step` UInt64 DEFAULT 0,
`metric` LowCardinality(String),
`value` Float64,
`unit` LowCardinality(String) DEFAULT '',
`tags_json` String DEFAULT ''
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_time)
ORDER BY (run_id, metric, host, rank, device, step, event_time);

- column "metric" has different string values e.g. loss, sys.cpu_percent, sys.mem_percent, sys.gpu.<idx>.util_percent, sys.disk.<mount>.percent, sys.net.<iface>.sent_bytes_per_s etc

Here’s my incomplete list to publish on Dashboard:

- loss t + 1
- loss t + 2
- NULL Router loss
- MoE Router loss
- validation loss
- token/sec
- batch/sec
- NULL ratio
- GSA stats
- recurrence performance
- mHC stats
- MoE favourite tokens graph
- MoE Fourier subject/Bucket
- current Bucket
- total tokens processed
- time to B1 stage/B2 stage
- time to 3B/8B/70B/SFT
- GPU utilization
- Data transfer speed
- GPU idle time
- CPU idle time
- checkpoint list
- checkpoint stats
- checkpoint benchmarks
- checkpoint hosted list
- generated samples

Backend (FastAPI + ClickHouse + SSE)
┌───────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────┐
│ File │ Purpose │
├───────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ config.py │ Pydantic Settings: CH_HOST, CH_PORT, CH_DATABASE, CH_USER, CH_PASSWORD, POLL_INTERVAL_SEC │
├───────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ db.py │ ClickHouse client singleton via clickhouse-connect │
├───────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ cache.py │ Versioned in-memory cache with LTTB decimation (2000-point cap), snapshot/delta methods │
├───────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ poller.py │ Async background task polling CH every 3s for active runs + new metrics │
├───────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ sse.py │ Broadcaster with per-client asyncio.Queue, fan-out, slow-client eviction │
├───────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ app.py │ FastAPI app with lifespan (starts poller, cleans up), CORS middleware │
├───────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ routes/stream.py │ GET /stream — SSE endpoint (snapshot on connect, then deltas) │
├───────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ routes/runs.py │ GET /runs — active run list from cache │
├───────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ routes/metrics.py │ GET /metrics/{run_id} — historical REST query with step range filters │
├───────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ routes/checkpoints.py │ GET /checkpoints/{run_id} — checkpoint data from CH │
└───────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────┘
Frontend (React + TypeScript + Vite + Tailwind + Zustand + uPlot)
┌───────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────┐
│ File │ Purpose │
├───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│ types/metrics.ts │ TypeScript types, tab-to-metric mapping, metricMatchesTab() helper │
├───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│ stores/metricsStore.ts │ Zustand store: applySnapshot/applyDelta, per-run per-metric series │
├───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│ hooks/useSSE.ts │ SSE connection with auto-reconnect (exponential backoff), parses snapshot/delta events │
├───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│ lib/decimation.ts │ Client-side LTTB downsampling utility │
├───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│ components/charts/TimeSeriesChart.tsx │ Generic uPlot wrapper with multi-run overlay, ResizeObserver │
├───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│ components/charts/MetricCard.tsx │ Card: title + latest value + chart, auto-formatted numbers │
├───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│ components/layout/Header.tsx │ Title bar with connection status indicator (green/yellow/red) │
├───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│ components/layout/Sidebar.tsx │ Tab navigation: Training, Model, System, Checkpoints, Progress │
├───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│ components/layout/RunBadges.tsx │ Color-coded active run pills │
├───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│ components/tabs/TrainingTab.tsx │ Loss curves, throughput, tokens grid │
├───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│ components/tabs/ModelTab.tsx │ MoE, GSA, mHC, null ratio charts │
├───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│ components/tabs/SystemTab.tsx │ GPU/CPU util, idle time, network charts │
├───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│ components/tabs/CheckpointsTab.tsx │ Checkpoint data table │
├───────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│ components/tabs/ProgressTab.tsx │ Milestone timeline/progress bars │
└───────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────┘
How to run

Backend: cd backend && uv run uvicorn app:app --reload --host 0.0.0.0 --port 8000

Frontend: cd frontend && npm run dev

The frontend dev server proxies /stream, /runs, /metrics, /checkpoints to the backend at :8000.

TEST

```curl -sk --cacert ~/ca.crt \
 "https://18.118.133.106:8443/?user=p12_reader&password=EndGameDashboard" \
 -d "SELECT metric, count(), avg(value) FROM training_observability.metric_points GROUP BY metric"
```
