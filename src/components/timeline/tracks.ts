export interface TrackConfig {
  id: string
  label: string
  kind: string   // 对应 AnyEvent['kind']
  color: string
  height: number
}

export const TRACKS: TrackConfig[] = [
  { id: 'derive',       label: '派生',  kind: 'DeriveEvent',       color: '#7C5CBF', height: 40 },
  { id: 'anim',         label: '动画',  kind: 'AnimEvent',         color: '#3A7BD5', height: 32 },
  { id: 'hit',          label: 'Hit',   kind: 'HitEvent',          color: '#E74C3C', height: 32 },
  { id: 'buff',         label: 'Buff',  kind: 'BuffEvent',         color: '#F39C12', height: 32 },
  { id: 'resource',     label: '资源',  kind: 'ResourceEvent',     color: '#27AE60', height: 32 },
  { id: 'vfx',          label: 'VFX',   kind: 'VFXEvent',          color: '#1ABC9C', height: 32 },
  { id: 'sfx',          label: 'SFX',   kind: 'SFXEvent',          color: '#9B59B6', height: 32 },
  { id: 'displacement', label: '位移',  kind: 'DisplacementEvent', color: '#E67E22', height: 32 },
  { id: 'state',        label: '状态',  kind: 'StateEvent',        color: '#2ECC71', height: 32 },
  { id: 'loop',         label: '循环',  kind: 'LoopEvent',         color: '#16A085', height: 32 },
  { id: 'camera',       label: '镜头',  kind: 'CameraEvent',       color: '#8E44AD', height: 32 },
]

export const RULER_HEIGHT = 28
/** 技能总长度专用轨道，紧贴 ruler 下方 */
export const DURATION_TRACK_HEIGHT = 20
export const TRACK_LABEL_WIDTH = 100
export const CANVAS_PADDING_RIGHT = 64
export const POINT_EVENT_RADIUS = 6
export const DURATION_HANDLE_WIDTH = 8
export const MIN_DURATION = 0.01
export const SNAP_UNIT = 0.01

/** 计算每条轨道的 Y 起点（相对于 canvas 顶部，含 ruler + duration track） */
export function getTrackY(trackIdx: number): number {
  let y = RULER_HEIGHT + DURATION_TRACK_HEIGHT
  for (let i = 0; i < trackIdx; i++) {
    y += TRACKS[i].height
  }
  return y
}

/** Canvas 内容区总高度 */
export function getTotalHeight(): number {
  return RULER_HEIGHT + DURATION_TRACK_HEIGHT + TRACKS.reduce((sum, t) => sum + t.height, 0)
}
