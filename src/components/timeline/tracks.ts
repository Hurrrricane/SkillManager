import { DeriveEvent } from '@/types'

export interface TrackConfig {
  id: string
  label: string
  kind: string
  color: string
  height: number
}

export const TRACKS: TrackConfig[] = [
  { id: 'hit',          label: 'Hit',   kind: 'HitEvent',          color: '#E74C3C', height: 32 },
  { id: 'displacement', label: '位移',  kind: 'DisplacementEvent', color: '#E67E22', height: 32 },
  { id: 'state',        label: '状态',  kind: 'StateEvent',        color: '#2ECC71', height: 32 },
  { id: 'resource',     label: '资源',  kind: 'ResourceEvent',     color: '#27AE60', height: 32 },
  { id: 'buff',         label: 'Buff',  kind: 'BuffEvent',         color: '#F39C12', height: 32 },
  { id: 'derive',       label: '派生',  kind: 'DeriveEvent',       color: '#7C5CBF', height: 36 },
  { id: 'anim',         label: '动画',  kind: 'AnimEvent',         color: '#3A7BD5', height: 32 },
  { id: 'vfx',          label: 'VFX',   kind: 'VFXEvent',          color: '#1ABC9C', height: 32 },
  { id: 'sfx',          label: 'SFX',   kind: 'SFXEvent',          color: '#9B59B6', height: 32 },
  { id: 'camera',       label: '镜头',  kind: 'CameraEvent',       color: '#8E44AD', height: 32 },
  { id: 'loop',         label: '循环',  kind: 'LoopEvent',         color: '#16A085', height: 32 },
]

export const RULER_HEIGHT = 28
export const DURATION_TRACK_HEIGHT = 20
export const DERIVE_ROW_HEIGHT = 36
export const TRACK_LABEL_WIDTH = 100
export const CANVAS_PADDING_RIGHT = 64
export const POINT_EVENT_RADIUS = 6
export const DURATION_HANDLE_WIDTH = 8
export const MIN_DURATION = 0.01
export const SNAP_UNIT = 0.01

// ── 派生行分配（贪心区间调度）────────────────────────────────────

/**
 * 计算每个 DeriveEvent 应放置在哪一行（避免视觉重叠）。
 * 返回 Map<eventId, rowIndex>
 */
export function calcDeriveRows(events: DeriveEvent[]): Map<number, number> {
  const sorted = [...events].sort((a, b) => a.deriveStart - b.deriveStart)
  // rowEnds[i] = 第 i 行当前最后一个事件的 deriveEnd
  const rowEnds: number[] = []
  const result = new Map<number, number>()

  for (const e of sorted) {
    let assigned = false
    for (let r = 0; r < rowEnds.length; r++) {
      if (rowEnds[r] <= e.deriveStart + 0.001) {
        rowEnds[r] = e.deriveEnd
        result.set(e.id, r)
        assigned = true
        break
      }
    }
    if (!assigned) {
      result.set(e.id, rowEnds.length)
      rowEnds.push(e.deriveEnd)
    }
  }
  return result
}

/** 派生轨道总高度（至少 1 行）*/
export function getDeriveTrackHeight(rowCount: number): number {
  return Math.max(1, rowCount) * DERIVE_ROW_HEIGHT
}

// ── 动态布局函数（传入 deriveRowCount）────────────────────────────

export function getTrackYDyn(trackIdx: number, deriveRowCount: number): number {
  let y = RULER_HEIGHT + DURATION_TRACK_HEIGHT
  for (let i = 0; i < trackIdx; i++) {
    y += TRACKS[i].kind === 'DeriveEvent'
      ? getDeriveTrackHeight(deriveRowCount)
      : TRACKS[i].height
  }
  return y
}

export function getTotalHeightDyn(deriveRowCount: number): number {
  return RULER_HEIGHT + DURATION_TRACK_HEIGHT + TRACKS.reduce((sum, t) =>
    sum + (t.kind === 'DeriveEvent' ? getDeriveTrackHeight(deriveRowCount) : t.height), 0)
}

// ── 保留原函数（兼容旧调用）──────────────────────────────────────

export function getTrackY(trackIdx: number): number {
  return getTrackYDyn(trackIdx, 1)
}

export function getTotalHeight(): number {
  return getTotalHeightDyn(1)
}
