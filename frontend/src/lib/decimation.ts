/**
 * Largest-Triangle-Three-Buckets (LTTB) downsampling for client-side use.
 * Takes parallel arrays and returns downsampled index array.
 */
export function lttbDecimate(
  x: number[],
  y: number[],
  target: number
): { x: number[]; y: number[] } {
  const n = x.length;
  if (n <= target) return { x, y };

  const bucketSize = (n - 2) / (target - 2);
  const outX: number[] = [x[0]];
  const outY: number[] = [y[0]];

  let aIdx = 0;

  for (let i = 1; i < target - 1; i++) {
    const bucketStart = Math.floor((i - 1) * bucketSize) + 1;
    const bucketEnd = Math.min(Math.floor(i * bucketSize) + 1, n - 1);
    const nextStart = Math.floor(i * bucketSize) + 1;
    const nextEnd = Math.min(Math.floor((i + 1) * bucketSize) + 1, n - 1);

    // Average of next bucket
    let avgX = 0, avgY = 0, cnt = 0;
    for (let j = nextStart; j <= nextEnd; j++) {
      avgX += x[j];
      avgY += y[j];
      cnt++;
    }
    avgX /= cnt;
    avgY /= cnt;

    let bestArea = -1;
    let bestIdx = bucketStart;
    const ax = x[aIdx], ay = y[aIdx];

    for (let j = bucketStart; j <= bucketEnd; j++) {
      const area = Math.abs(
        (ax - avgX) * (y[j] - ay) - (ax - x[j]) * (avgY - ay)
      ) * 0.5;
      if (area > bestArea) {
        bestArea = area;
        bestIdx = j;
      }
    }

    outX.push(x[bestIdx]);
    outY.push(y[bestIdx]);
    aIdx = bestIdx;
  }

  outX.push(x[n - 1]);
  outY.push(y[n - 1]);

  return { x: outX, y: outY };
}
