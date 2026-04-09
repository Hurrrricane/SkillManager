import { AnimEvent } from '@/types'
import { useEventStore } from '@/store'
import { NumberInput } from '../fields/NumberInput'
import styles from './Panel.module.css'

interface Props { event: AnimEvent }

export function AnimEventPanel({ event }: Props) {
  const { updateEvent } = useEventStore.getState()
  const up = (patch: Partial<AnimEvent>) => updateEvent(event.skillId, event.id, 'AnimEvent', patch as never)

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>动画事件</div>
      <NumberInput label="触发时间 (s)" value={event.triggerTime} onChange={v => up({ triggerTime: v })} min={0} />
      <div className={styles.field}>
        <label>动画名称</label>
        <input value={event.animName} onChange={e => up({ animName: e.target.value })} />
      </div>
    </div>
  )
}
