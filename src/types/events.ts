import {
  EBuffTarget, ECameraType, EDisplacementDir,
  EEaseCurve, EHitShape, EResourceType, EStateFlag,
} from './enums'

// ── 判别标签 ─────────────────────────────────────────────────

export type EventKind =
  | 'AnimEvent'
  | 'HitEvent'
  | 'BuffEvent'
  | 'ResourceEvent'
  | 'VFXEvent'
  | 'SFXEvent'
  | 'DeriveEvent'
  | 'DisplacementEvent'
  | 'StateEvent'
  | 'LoopEvent'
  | 'CameraEvent'

// ── 点事件 ────────────────────────────────────────────────────

export interface AnimEvent {
  kind: 'AnimEvent'
  id: number
  skillId: number
  triggerTime: number
  animName: string
}

export interface HitEvent {
  kind: 'HitEvent'
  id: number
  skillId: number
  triggerTime: number
  shape: EHitShape
  offsetX: number
  offsetY: number
  shapeParam1: number
  shapeParam2: number
  damage: number
  stagger: number
  knockback: number
  poiseDamage: number
  comboCount: number
  hitStop: number
}

export interface BuffEvent {
  kind: 'BuffEvent'
  id: number
  skillId: number
  triggerTime: number
  buffId: number
  target: EBuffTarget
  duration: number
  stackCount: number
}

export interface ResourceEvent {
  kind: 'ResourceEvent'
  id: number
  skillId: number
  triggerTime: number
  resourceType: EResourceType
  value: number
  isPercent: boolean
}

export interface VFXEvent {
  kind: 'VFXEvent'
  id: number
  skillId: number
  triggerTime: number
  effectId: string
  attachPoint: string
  offsetX: number
  offsetY: number
  offsetZ: number
  rotation: number
  scale: number
  duration: number
  followChar: boolean
}

export interface SFXEvent {
  kind: 'SFXEvent'
  id: number
  skillId: number
  triggerTime: number
  audioId: string
  volume: number
  loop: boolean
  stopTime: number
}

// ── 特殊事件（派生）──────────────────────────────────────────

export interface DeriveEvent {
  kind: 'DeriveEvent'
  id: number
  skillId: number
  targetSkillIds: number[]
  deriveStart: number
  deriveEnd: number
  enablePreInput: boolean
  preInputPoint: number
}

// ── 持续事件 ─────────────────────────────────────────────────

export interface DisplacementEvent {
  kind: 'DisplacementEvent'
  id: number
  skillId: number
  startTime: number
  endTime: number
  direction: EDisplacementDir
  customAngle: number
  distance: number
  curve: EEaseCurve
  ignoreCollision: boolean
}

export interface StateEvent {
  kind: 'StateEvent'
  id: number
  skillId: number
  startTime: number
  endTime: number
  stateFlags: EStateFlag
}

export interface LoopEvent {
  kind: 'LoopEvent'
  id: number
  skillId: number
  startTime: number
  endTime: number
  maxDuration: number
}

export interface CameraEvent {
  kind: 'CameraEvent'
  id: number
  skillId: number
  startTime: number
  endTime: number
  cameraType: ECameraType
  intensity: number
  curve: EEaseCurve
}

// ── 联合类型 ─────────────────────────────────────────────────

export type PointEvent =
  | AnimEvent | HitEvent | BuffEvent | ResourceEvent | VFXEvent | SFXEvent

export type DurationEvent =
  | DisplacementEvent | StateEvent | LoopEvent | CameraEvent

export type AnyEvent = PointEvent | DurationEvent | DeriveEvent

// ── 类型守卫 ─────────────────────────────────────────────────

export function isPointEvent(e: AnyEvent): e is PointEvent {
  return 'triggerTime' in e
}

export function isDurationEvent(e: AnyEvent): e is DurationEvent {
  return 'startTime' in e && e.kind !== 'DeriveEvent'
}

export function isDeriveEvent(e: AnyEvent): e is DeriveEvent {
  return e.kind === 'DeriveEvent'
}
