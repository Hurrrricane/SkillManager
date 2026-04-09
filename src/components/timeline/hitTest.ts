import { AnyEvent, DeriveEvent, isDeriveEvent, isPointEvent } from '@/types'
import {
  TRACKS, RULER_HEIGHT, DURATION_TRACK_HEIGHT, DERIVE_ROW_HEIGHT,
  POINT_EVENT_RADIUS, DURATION_HANDLE_WIDTH,
  getDeriveTrackHeight, getTrackYDyn,
} from './tracks'

export type HitZone = 'body' | 'left' | 'right' | 'preInput'

export interface HitResult {
  event: AnyEvent
  trackIdx: number
  zone: HitZone
}

export interface SkillDurationHit { type: 'skillDuration' }
export type AnyHit = HitResult | SkillDurationHit

export function hitTest(
  cx: number,
  cy: number,
  events: AnyEvent[],
  zoom: number,
  scrollX: number,
  skillDuration: number,
  deriveRows: Map<number, number>,
  deriveRowCount: number,
): AnyHit | null {
  const timeToX = (t: number) => t * zoom - scrollX

  // duration track
  if (cy >= RULER_HEIGHT && cy < RULER_HEIGHT + DURATION_TRACK_HEIGHT) {
    const sdX = timeToX(skillDuration)
    if (Math.abs(cx - sdX) <= DURATION_HANDLE_WIDTH + 2) return { type: 'skillDuration' }
    return null
  }

  for (let ti = 0; ti < TRACKS.length; ti++) {
    const track = TRACKS[ti]
    const ty = getTrackYDyn(ti, deriveRowCount)
    const th = track.kind === 'DeriveEvent'
      ? getDeriveTrackHeight(deriveRowCount)
      : track.height

    if (cy < ty || cy >= ty + th) continue

    const trackEvents = events.filter(e => e.kind === track.kind)

    for (const event of trackEvents) {
      if (isPointEvent(event)) {
        const ex = timeToX(event.triggerTime)
        if (Math.abs(cx - ex) <= POINT_EVENT_RADIUS + 2) return { event, trackIdx: ti, zone: 'body' }

      } else if (isDeriveEvent(event)) {
        const rowIdx = deriveRows.get(event.id) ?? 0
        const rowY = ty + rowIdx * DERIVE_ROW_HEIGHT

        // preInput marker
        if (event.enablePreInput) {
          const px = timeToX(event.preInputPoint)
          const rowCy = rowY + DERIVE_ROW_HEIGHT / 2
          if (Math.abs(cx - px) <= POINT_EVENT_RADIUS + 2 && Math.abs(cy - rowCy) <= DERIVE_ROW_HEIGHT / 2) {
            return { event, trackIdx: ti, zone: 'preInput' }
          }
        }

        if (cy < rowY || cy >= rowY + DERIVE_ROW_HEIGHT) continue
        const x1 = timeToX(event.deriveStart)
        const x2 = timeToX(event.deriveEnd)
        if (cx < x1 - DURATION_HANDLE_WIDTH || cx > x2 + DURATION_HANDLE_WIDTH) continue
        if (cx <= x1 + DURATION_HANDLE_WIDTH) return { event, trackIdx: ti, zone: 'left' }
        if (cx >= x2 - DURATION_HANDLE_WIDTH) return { event, trackIdx: ti, zone: 'right' }
        return { event, trackIdx: ti, zone: 'body' }

      } else {
        const ev = event as { startTime: number; endTime: number }
        const x1 = timeToX(ev.startTime)
        const x2 = timeToX(ev.endTime)
        if (cx < x1 - DURATION_HANDLE_WIDTH || cx > x2 + DURATION_HANDLE_WIDTH) continue
        if (cx <= x1 + DURATION_HANDLE_WIDTH) return { event, trackIdx: ti, zone: 'left' }
        if (cx >= x2 - DURATION_HANDLE_WIDTH) return { event, trackIdx: ti, zone: 'right' }
        return { event, trackIdx: ti, zone: 'body' }
      }
    }
  }
  return null
}

export function isSkillDurationHit(h: AnyHit): h is SkillDurationHit {
  return (h as SkillDurationHit).type === 'skillDuration'
}
export function isEventHit(h: AnyHit): h is HitResult {
  return !isSkillDurationHit(h)
}

export function cursorForHit(hit: AnyHit | null, isRuler: boolean): string {
  if (isRuler) return 'default'
  if (!hit) return 'default'
  if (isSkillDurationHit(hit)) return 'ew-resize'
  const h = hit as HitResult
  if (h.zone === 'left' || h.zone === 'right' || h.zone === 'preInput') return 'ew-resize'
  return 'grab'
}
