import { DeriveEvent } from '@/types'
import { useEventStore, useSkillStore } from '@/store'
import { NumberInput } from '../fields/NumberInput'
import styles from './Panel.module.css'

interface Props { event: DeriveEvent }

export function DeriveEventPanel({ event }: Props) {
  const { updateEvent } = useEventStore.getState()
  const skills = useSkillStore(s => s.skills)
  const up = (patch: Partial<DeriveEvent>) => updateEvent(event.skillId, event.id, 'DeriveEvent', patch as never)

  const toggleTarget = (id: number, checked: boolean) => {
    const ids = checked
      ? [...event.targetSkillIds, id]
      : event.targetSkillIds.filter(x => x !== id)
    up({ targetSkillIds: ids })
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>派生事件</div>
      <div className={styles.row2}>
        <NumberInput label="派生起点 (s)" value={event.deriveStart} onChange={v => up({ deriveStart: v })} min={0} />
        <NumberInput label="派生终点 (s)" value={event.deriveEnd} onChange={v => up({ deriveEnd: v })} min={0} />
      </div>
      <div className={styles.checkField}>
        <span>预输入</span>
        <label className={styles.toggle}>
          <input type="checkbox" checked={event.enablePreInput} onChange={e => up({ enablePreInput: e.target.checked })} />
          启用
        </label>
      </div>
      {event.enablePreInput && (
        <NumberInput label="预输入点 (s)" value={event.preInputPoint} onChange={v => up({ preInputPoint: v })} min={0} />
      )}
      <div className={styles.section}>目标技能</div>
      <div className={styles.targetList}>
        {skills.filter(s => s.id !== event.skillId).map(s => (
          <label key={s.id} className={styles.targetItem}>
            <input
              type="checkbox"
              checked={event.targetSkillIds.includes(s.id)}
              onChange={e => toggleTarget(s.id, e.target.checked)}
            />
            #{s.id} {s.name}
          </label>
        ))}
      </div>
    </div>
  )
}
