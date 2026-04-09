import { useUIStore, useEventStore, useSkillStore } from '@/store'
import { AnyEvent } from '@/types'
import { AnimEventPanel } from './panels/AnimEventPanel'
import { HitEventPanel } from './panels/HitEventPanel'
import { DeriveEventPanel } from './panels/DeriveEventPanel'
import { DisplacementEventPanel } from './panels/DisplacementEventPanel'
import { StateEventPanel } from './panels/StateEventPanel'
import { BuffEventPanel } from './panels/BuffEventPanel'
import { ResourceEventPanel } from './panels/ResourceEventPanel'
import { VFXEventPanel } from './panels/VFXEventPanel'
import { SFXEventPanel } from './panels/SFXEventPanel'
import { LoopEventPanel } from './panels/LoopEventPanel'
import { CameraEventPanel } from './panels/CameraEventPanel'
import { SkillPropertiesPanel } from './SkillPropertiesPanel'
import styles from './PropertyPanel.module.css'

function renderEventPanel(event: AnyEvent) {
  switch (event.kind) {
    case 'AnimEvent':         return <AnimEventPanel event={event} />
    case 'HitEvent':          return <HitEventPanel event={event} />
    case 'DeriveEvent':       return <DeriveEventPanel event={event} />
    case 'DisplacementEvent': return <DisplacementEventPanel event={event} />
    case 'StateEvent':        return <StateEventPanel event={event} />
    case 'BuffEvent':         return <BuffEventPanel event={event as never} />
    case 'ResourceEvent':     return <ResourceEventPanel event={event as never} />
    case 'VFXEvent':          return <VFXEventPanel event={event as never} />
    case 'SFXEvent':          return <SFXEventPanel event={event as never} />
    case 'LoopEvent':         return <LoopEventPanel event={event as never} />
    case 'CameraEvent':       return <CameraEventPanel event={event as never} />
  }
}

export function PropertyPanel() {
  const selectedEvent  = useUIStore(s => s.selectedEvent)
  const selectedSkillId = useSkillStore(s => s.selectedSkillId)
  const events = useEventStore(s => selectedSkillId ? (s.index[selectedSkillId] ?? []) : [])

  const event = selectedEvent
    ? events.find(e => e.id === selectedEvent.id && e.kind === selectedEvent.kind)
    : null

  if (!selectedSkillId) {
    return <div className={styles.empty}>未选择技能</div>
  }

  if (!event) {
    // 未选中事件 → 显示技能属性
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.kindTag}>技能属性</span>
        </div>
        <div className={styles.body}>
          <SkillPropertiesPanel />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.kindTag}>{event.kind}</span>
        <span className={styles.idTag}>#{event.id}</span>
        <button
          className={styles.backBtn}
          onClick={() => useUIStore.getState().selectEvent(null)}
          title="返回技能属性"
        >← 技能</button>
      </div>
      <div className={styles.body}>
        {renderEventPanel(event)}
      </div>
    </div>
  )
}
