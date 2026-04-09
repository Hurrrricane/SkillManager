import { useEventStore, useSkillStore, useUIStore } from '@/store'
import { AnyEvent, isDeriveEvent, isPointEvent } from '@/types'
import { TRACKS } from '@/components/timeline/tracks'
import styles from './TrackPanel.module.css'

function eventTimeLabel(event: AnyEvent): string {
  if (isPointEvent(event)) return `t=${event.triggerTime.toFixed(2)}s`
  if (isDeriveEvent(event)) return `${event.deriveStart.toFixed(2)}s – ${event.deriveEnd.toFixed(2)}s`
  const ev = event as { startTime: number; endTime: number }
  return `${ev.startTime.toFixed(2)}s – ${ev.endTime.toFixed(2)}s`
}

export function TrackPanel({ kind }: { kind: string }) {
  const selectedSkillId = useSkillStore(s => s.selectedSkillId)
  const events = useEventStore(s => selectedSkillId ? (s.index[selectedSkillId] ?? []) : [])
  const track = TRACKS.find(t => t.kind === kind)
  const trackEvents = events.filter(e => e.kind === kind)
    .sort((a, b) => {
      const aT = isPointEvent(a) ? a.triggerTime : isDeriveEvent(a) ? a.deriveStart : (a as { startTime: number }).startTime
      const bT = isPointEvent(b) ? b.triggerTime : isDeriveEvent(b) ? b.deriveStart : (b as { startTime: number }).startTime
      return aT - bT
    })

  const handleJump = (event: AnyEvent) => {
    useUIStore.getState().selectEvent({ id: event.id, kind: event.kind, skillId: event.skillId })
    // scroll timeline to event
    const { timelineZoom, setScrollX } = useUIStore.getState()
    const t = isPointEvent(event) ? event.triggerTime : isDeriveEvent(event) ? event.deriveStart : (event as { startTime: number }).startTime
    const targetX = t * timelineZoom - 80
    setScrollX(Math.max(0, targetX))
  }

  const handleDelete = (event: AnyEvent) => {
    if (!selectedSkillId) return
    useEventStore.getState().deleteEvent(selectedSkillId, event.id, event.kind)
  }

  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <span className={styles.count}>{trackEvents.length}</span>
        <span className={styles.countLabel}>个事件</span>
      </div>

      {trackEvents.length === 0 && (
        <div className={styles.empty}>暂无事件，点击下方添加</div>
      )}

      <div className={styles.list}>
        {trackEvents.map(event => (
          <div key={event.id} className={styles.item}>
            <div className={styles.itemInfo}>
              <span className={styles.itemId}>#{event.id}</span>
              <span className={styles.itemTime}>{eventTimeLabel(event)}</span>
            </div>
            <div className={styles.itemActions}>
              <button
                className={styles.jumpBtn}
                onClick={() => handleJump(event)}
                title="跳转并选中"
              >
                定位
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(event)}
                title="删除事件"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.addSection}>
        <button
          className={styles.addBtn}
          style={{ borderLeft: `3px solid ${track?.color ?? '#888'}` }}
          onClick={() => {
            if (!selectedSkillId) return
            const { addEvent } = useEventStore.getState()
            addEvent(makeDefaultForTrack(kind, selectedSkillId, events))
          }}
        >
          ＋ 添加 {track?.label ?? kind}
        </button>
      </div>
    </div>
  )
}

function makeDefaultForTrack(kind: string, skillId: number, existingEvents: AnyEvent[]): Omit<AnyEvent, 'id'> {
  const sameKind = existingEvents.filter(e => e.kind === kind)

  // calculate end time of last event of this kind
  let lastEnd = 0
  for (const e of sameKind) {
    if (isPointEvent(e)) lastEnd = Math.max(lastEnd, e.triggerTime)
    else if (isDeriveEvent(e)) lastEnd = Math.max(lastEnd, e.deriveEnd)
    else lastEnd = Math.max(lastEnd, (e as { endTime: number }).endTime)
  }
  const pt = parseFloat((lastEnd + 0.5).toFixed(2))   // point event time
  const ds = parseFloat((lastEnd + 0.5).toFixed(2))   // duration start
  const de = parseFloat((lastEnd + 1.0).toFixed(2))   // duration end

  switch (kind) {
    case 'AnimEvent':         return { kind: 'AnimEvent',         skillId, triggerTime: pt,  animName: 'new_anim' }
    case 'HitEvent':           return { kind: 'HitEvent',           skillId, triggerTime: pt, shape: 2, offsetX: 0, offsetY: 1, shapeParam1: 2, shapeParam2: 90, damage: 100, stagger: 0.3, knockback: 0.5, poiseDamage: 10, comboCount: 1, hitStop: 0.05 }
    case 'PersistentHitEvent': return { kind: 'PersistentHitEvent', skillId, startTime: ds, endTime: de, subType: 0, shape: 0, offsetX: 0, offsetY: 0.5, shapeParam1: 0.4, shapeParam2: 0, speed: 8, destroyOnHit: true, hitInterval: 0, maxHitsPerTarget: 0, damage: 80, stagger: 0.1, knockback: 0.3, poiseDamage: 5, hitStop: 0.03 }
    case 'BuffEvent':         return { kind: 'BuffEvent',         skillId, triggerTime: pt,  buffId: 1, target: 0, duration: 0, stackCount: 1 }
    case 'ResourceEvent':     return { kind: 'ResourceEvent',     skillId, triggerTime: pt,  resourceType: 0, value: 10, isPercent: false }
    case 'VFXEvent':          return { kind: 'VFXEvent',          skillId, triggerTime: pt,  effectId: 'vfx_new', attachPoint: '', offsetX: 0, offsetY: 0, offsetZ: 0, rotation: 0, scale: 1, duration: 0, followChar: true }
    case 'SFXEvent':          return { kind: 'SFXEvent',          skillId, triggerTime: pt,  audioId: 'sfx_new', volume: 1, loop: false, stopTime: 0 }
    case 'DeriveEvent':       return { kind: 'DeriveEvent',       skillId, targetSkillIds: [], deriveStart: ds, deriveEnd: de, enablePreInput: false, preInputPoint: 0 }
    case 'DisplacementEvent': return { kind: 'DisplacementEvent', skillId, startTime: ds, endTime: de, direction: 0, customAngle: 0, distance: 2, curve: 2, ignoreCollision: false }
    case 'StateEvent':        return { kind: 'StateEvent',        skillId, startTime: ds, endTime: de, stateFlags: 1 }
    case 'LoopEvent':         return { kind: 'LoopEvent',         skillId, startTime: ds, endTime: de, maxDuration: 0 }
    case 'CameraEvent':       return { kind: 'CameraEvent',       skillId, startTime: ds, endTime: de, cameraType: 0, intensity: 0.2, curve: 2 }
    default:                  return { kind: kind as AnyEvent['kind'], skillId } as Omit<AnyEvent, 'id'>
  }
}
