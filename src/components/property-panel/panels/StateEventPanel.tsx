import { StateEvent, EStateFlag } from '@/types'
import { useEventStore } from '@/store'
import { NumberInput } from '../fields/NumberInput'
import { FlagsCheckbox } from '../fields/FlagsCheckbox'
import styles from './Panel.module.css'

const FLAG_OPTIONS = [
  { label: '霸体', flag: EStateFlag.SuperArmor },
  { label: '无敌', flag: EStateFlag.Invincible },
  { label: '免疫闪避取消', flag: EStateFlag.DodgeCancelImmune },
  { label: '免疫技能取消', flag: EStateFlag.SkillCancelImmune },
  { label: '免疫浮空', flag: EStateFlag.AirborneImmune },
  { label: '免疫抓取', flag: EStateFlag.GrabImmune },
]

interface Props { event: StateEvent }

export function StateEventPanel({ event }: Props) {
  const { updateEvent } = useEventStore.getState()
  const up = (patch: Partial<StateEvent>) => updateEvent(event.skillId, event.id, 'StateEvent', patch as never)

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>状态事件</div>
      <div className={styles.row2}>
        <NumberInput label="开始时间 (s)" value={event.startTime} onChange={v => up({ startTime: v })} min={0} />
        <NumberInput label="结束时间 (s)" value={event.endTime} onChange={v => up({ endTime: v })} min={0} />
      </div>
      <FlagsCheckbox label="状态标记" value={event.stateFlags} options={FLAG_OPTIONS} onChange={v => up({ stateFlags: v })} />
    </div>
  )
}
