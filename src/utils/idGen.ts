const counters: Record<string, number> = {}

export function nextId(namespace: string): number {
  counters[namespace] = (counters[namespace] ?? 0) + 1
  return counters[namespace]
}

export function resetCounters(snapshot: Record<string, number>): void {
  for (const [k, v] of Object.entries(snapshot)) {
    counters[k] = v
  }
}

/** 初始化计数器，确保不低于已有数据的最大 id */
export function ensureCounter(namespace: string, minValue: number): void {
  if ((counters[namespace] ?? 0) < minValue) {
    counters[namespace] = minValue
  }
}
