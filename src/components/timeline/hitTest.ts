import { AnyEvent, DeriveEvent, isDeriveEvent, isPointEvent } from '@/types'
import {
  TRACKS, RULER_HEIGHT, DURATION_TRACK_HEIGHT,
  POINT_EVENT_RADIUS, DURATION_HANDLE_WIDTH,
  getTrackY,
} from './tracks'

export type HitZone = 'body' | 'left' | 'right' | 'preInput'

export interface HitResult {
  event: AnyEvent
  trackIdx: number
  zone: HitZone
}

export interface SkillDurationHit {
  type: 'skillDuration'
}

export type AnyHit = HitResult | SkillDurationHit

/**
 * 命中检测：先检查 duration 轨道，再检查事件轨道。
 */
export function hitTest(
  cx: number,
  cy: number,
  events: AnyEvent[],
  zoom: number,
  scrollX: number,
  skillDuration: number,
): AnyHit | null {
  const timeToX = (t: number) => t * zoom - scrollX

  // ── 技能总长度轨道（ruler 正下方）────────────────────────────
  const dty = RULER_HEIGHT
  if (cy >= dty && cy < dty + DURATION_TRACK_HEIGHT) {
    const sdX = timeToX(skillDuration)
    if (Math.abs(cx - sdX) <= DURATION_HANDLE_WIDTH + 2) {
      return { type: 'skillDuration' }
    }
    return null
  }

  // ── 事件轨道 ─────────────────────────────────────────────────
  for (let ti = 0; ti < TRACKS.length; ti++) {
    const track = TRACKS[ti]
    const ty = getTrackY(ti)
    if (cy < ty || cy >= ty + track.height) continue

    const trackEvents = events.filter(e => e.kind === track.kind)

    for (const event of trackEvents) {
      if (isPointEvent(event)) {
        const ex = timeToX(event.triggerTime)
        if (Math.abs(cx - ex) <= POINT_EVENT_RADIUS + 2) {
          return { event, trackIdx: ti, zone: 'body' }
        }
      } else if (isDeriveEvent(event)) {
        // 先检测 preInput 点（小菱形标记）
        if (event.enablePreInput) {
          const px = timeToX(event.preInputPoint)
          if (Math.abs(cx - px) <= POINT_EVENT_RADIUS + 2) {
            return { event, trackIdx: ti, zone: 'preInput' }
          }
        }
        const x1 = timeToX(event.deriveStart)
        const x2 = timeToX(event.deriveEnd)
        if (cx < x1 - DURATION_HANDLE_WIDTH || cx > x2 + DURATION_HANDLE_WIDTH) continue
        if (cx <= x1 + DURATION_HANDLE_WIDTH) return { event, trackIdx: ti, zone: 'left' }
        if (cx >= x2 - DURATION_HANDLE_WIDTH) return { event, trackIdx: ti, zone: 'right' }
        return { event, trackIdx: ti, zone: 'body' }
      } else {
        const e = event as { startTime: number; endTime: number }
        const x1 = timeToX(e.startTime)
        const x2 = timeToX(e.endTime)
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

/** 根据命中区域判断鼠标 cursor */
export function cursorForHit(hit: AnyHit | null, isRuler: boolean, isDurationTrack: boolean): string {
  if (isRuler) return 'default'
  if (!hit) return 'default'
  if (isSkillDurationHit(hit) || isDurationTrack) return 'ew-resize'
  const h = hit as HitResult
  if (h.zone === 'left' || h.zone === 'right' || h.zone === 'preInput') return 'ew-resize'
  return 'grab'
}
