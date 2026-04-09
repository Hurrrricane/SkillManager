import { create } from 'zustand'
import {
  AnyEvent, DeriveEvent, AnimEvent, HitEvent, PersistentHitEvent,
  DisplacementEvent, StateEvent, CameraEvent,
} from '@/types'
import {
  EHitShape, EPersistentHitSubType, EDisplacementDir, EEaseCurve, ECameraType, EStateFlag,
} from '@/types'
import { nextId, ensureCounter } from '@/utils/idGen'

// Mock 数据：三连斩各事件
const MOCK_EVENTS: AnyEvent[] = [
  // ── DeriveEvent ──────────────────────────────────────────────
  { kind: 'DeriveEvent', id: 1, skillId: 1001, targetSkillIds: [1002], deriveStart: 0.4, deriveEnd: 1.0, enablePreInput: true, preInputPoint: 0.3 },
  { kind: 'DeriveEvent', id: 2, skillId: 1002, targetSkillIds: [1003], deriveStart: 0.5, deriveEnd: 1.1, enablePreInput: true, preInputPoint: 0.35 },
  { kind: 'DeriveEvent', id: 3, skillId: 1003, targetSkillIds: [1001], deriveStart: 0.7, deriveEnd: 1.4, enablePreInput: false, preInputPoint: 0 },
  // ── AnimEvent ────────────────────────────────────────────────
  { kind: 'AnimEvent', id: 1, skillId: 1001, triggerTime: 0, animName: 'slash_1' },
  { kind: 'AnimEvent', id: 2, skillId: 1002, triggerTime: 0, animName: 'slash_2' },
  { kind: 'AnimEvent', id: 3, skillId: 1003, triggerTime: 0, animName: 'slash_3' },
  // ── HitEvent ─────────────────────────────────────────────────
  { kind: 'HitEvent', id: 1, skillId: 1001, triggerTime: 0.25, shape: EHitShape.Fan,    offsetX: 0, offsetY: 1.0, shapeParam1: 2.5, shapeParam2: 90,  damage: 100, stagger: 0.3, knockback: 0.5, poiseDamage: 10, comboCount: 1, hitStop: 0.05 },
  { kind: 'HitEvent', id: 2, skillId: 1002, triggerTime: 0.35, shape: EHitShape.Circle, offsetX: 0, offsetY: 0,   shapeParam1: 3.0, shapeParam2: 0,   damage: 120, stagger: 0.3, knockback: 0.8, poiseDamage: 15, comboCount: 1, hitStop: 0.05 },
  { kind: 'HitEvent', id: 3, skillId: 1003, triggerTime: 0.5,  shape: EHitShape.Fan,    offsetX: 0, offsetY: 1.5, shapeParam1: 3.5, shapeParam2: 120, damage: 200, stagger: 0.8, knockback: 3.0, poiseDamage: 30, comboCount: 1, hitStop: 0.1  },
  // ── PersistentHitEvent ───────────────────────────────────────
  { kind: 'PersistentHitEvent', id: 1, skillId: 1001, startTime: 0.2, endTime: 1.5, subType: EPersistentHitSubType.Wave,  shape: EHitShape.Circle, offsetX: 0, offsetY: 0.5, shapeParam1: 0.4, shapeParam2: 0, speed: 8, destroyOnHit: true,  hitInterval: 0,   maxHitsPerTarget: 0, damage: 80,  stagger: 0.1, knockback: 0.3, poiseDamage: 5,  hitStop: 0.03 },
  { kind: 'PersistentHitEvent', id: 2, skillId: 1003, startTime: 0.4, endTime: 2.0, subType: EPersistentHitSubType.Field, shape: EHitShape.Circle, offsetX: 0, offsetY: 1.5, shapeParam1: 1.5, shapeParam2: 0, speed: 0, destroyOnHit: false, hitInterval: 0.3, maxHitsPerTarget: 5, damage: 40,  stagger: 0.1, knockback: 0.0, poiseDamage: 3,  hitStop: 0.02 },
  // ── DisplacementEvent ────────────────────────────────────────
  { kind: 'DisplacementEvent', id: 1, skillId: 1001, startTime: 0.1, endTime: 0.3, direction: EDisplacementDir.Forward, customAngle: 0, distance: 2.0, curve: EEaseCurve.EaseOut, ignoreCollision: false },
  { kind: 'DisplacementEvent', id: 2, skillId: 1003, startTime: 0.3, endTime: 0.55, direction: EDisplacementDir.Forward, customAngle: 0, distance: 3.0, curve: EEaseCurve.EaseIn, ignoreCollision: false },
  // ── StateEvent ───────────────────────────────────────────────
  { kind: 'StateEvent', id: 1, skillId: 1003, startTime: 0.2, endTime: 0.6, stateFlags: EStateFlag.SuperArmor },
  // ── CameraEvent ──────────────────────────────────────────────
  { kind: 'CameraEvent', id: 1, skillId: 1003, startTime: 0.5, endTime: 0.65, cameraType: ECameraType.Shake, intensity: 0.3, curve: EEaseCurve.EaseOut },
  // ── VFXEvent ─────────────────────────────────────────────────
  { kind: 'VFXEvent', id: 1, skillId: 1001, triggerTime: 0.2,  effectId: 'vfx_slash_01',     attachPoint: 'weapon_tip', offsetX: 0, offsetY: 0, offsetZ: 0, rotation: 0, scale: 1.0, duration: 0, followChar: true },
  { kind: 'VFXEvent', id: 2, skillId: 1002, triggerTime: 0.3,  effectId: 'vfx_slash_circle', attachPoint: '',           offsetX: 0, offsetY: 0, offsetZ: 0, rotation: 0, scale: 1.2, duration: 0, followChar: false },
  { kind: 'VFXEvent', id: 3, skillId: 1003, triggerTime: 0.45, effectId: 'vfx_slash_heavy',  attachPoint: 'weapon_tip', offsetX: 0, offsetY: 0, offsetZ: 0, rotation: 0, scale: 1.5, duration: 0, followChar: true },
  // ── SFXEvent ─────────────────────────────────────────────────
  { kind: 'SFXEvent', id: 1, skillId: 1001, triggerTime: 0.2,  audioId: 'sfx_slash_light',  volume: 1.0, loop: false, stopTime: 0 },
  { kind: 'SFXEvent', id: 2, skillId: 1002, triggerTime: 0.3,  audioId: 'sfx_slash_whoosh', volume: 1.0, loop: false, stopTime: 0 },
  { kind: 'SFXEvent', id: 3, skillId: 1003, triggerTime: 0.45, audioId: 'sfx_slash_heavy',  volume: 1.2, loop: false, stopTime: 0 },
  // ── ResourceEvent ────────────────────────────────────────────
  { kind: 'ResourceEvent', id: 1, skillId: 1003, triggerTime: 0.5, resourceType: 3, value: 15, isPercent: false },
]

// 初始化各表计数器
const counterMap: Record<string, number> = {}
for (const e of MOCK_EVENTS) {
  const key = e.kind
  counterMap[key] = Math.max(counterMap[key] ?? 0, e.id)
}
for (const [k, v] of Object.entries(counterMap)) {
  ensureCounter(k, v)
}

/** 按 skillId 分组的事件索引 */
type EventIndex = Record<number, AnyEvent[]>

function buildIndex(events: AnyEvent[]): EventIndex {
  const idx: EventIndex = {}
  for (const e of events) {
    if (!idx[e.skillId]) idx[e.skillId] = []
    idx[e.skillId].push(e)
  }
  return idx
}

interface EventStore {
  /** 全量列表，方便 CSV 导出 */
  events: AnyEvent[]
  /** 按 skillId 的索引，时间轴查询用 */
  index: EventIndex

  addEvent: (event: Omit<AnyEvent, 'id'>) => AnyEvent
  updateEvent: (skillId: number, id: number, kind: AnyEvent['kind'], patch: Partial<AnyEvent>) => void
  deleteEvent: (skillId: number, id: number, kind: AnyEvent['kind']) => void
}

export const useEventStore = create<EventStore>((set) => ({
  events: MOCK_EVENTS,
  index: buildIndex(MOCK_EVENTS),

  addEvent: (draft) => {
    const id = nextId(draft.kind)
    const event = { ...draft, id } as AnyEvent
    set(s => {
      const events = [...s.events, event]
      return { events, index: buildIndex(events) }
    })
    return event
  },

  updateEvent: (skillId, id, kind, patch) => {
    set(s => {
      const events = s.events.map(e =>
        e.skillId === skillId && e.id === id && e.kind === kind
          ? { ...e, ...patch } as AnyEvent
          : e
      )
      return { events, index: buildIndex(events) }
    })
  },

  deleteEvent: (skillId, id, kind) => {
    set(s => {
      const events = s.events.filter(e =>
        !(e.skillId === skillId && e.id === id && e.kind === kind)
      )
      return { events, index: buildIndex(events) }
    })
  },
}))

/** 获取某技能的所有事件 */
export function getEventsForSkill(skillId: number): AnyEvent[] {
  return useEventStore.getState().index[skillId] ?? []
}
