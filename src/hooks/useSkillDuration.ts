import { useMemo } from 'react'
import { useEventStore } from '@/store'
import { isDeriveEvent } from '@/types'

/**
 * 计算技能时间轴的实际终点：
 * max(skillDuration, max(所有 DeriveEvent.deriveEnd))
 */
export function useTimelineEnd(skillId: number, skillDuration: number): number {
  const events = useEventStore(s => s.index[skillId] ?? [])

  return useMemo(() => {
    let max = skillDuration
    for (const e of events) {
      if (isDeriveEvent(e) && e.deriveEnd > max) {
        max = e.deriveEnd
      }
    }
    return max
  }, [events, skillDuration])
}
