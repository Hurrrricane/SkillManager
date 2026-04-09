import { DisplacementEvent, EDisplacementDir, EEaseCurve } from '@/types'
import { useEventStore } from '@/store'
import { NumberInput } from '../fields/NumberInput'
import { EnumSelect } from '../fields/EnumSelect'
import styles from './Panel.module.css'

const DIR_OPTIONS = [
  { label: '前方', value: EDisplacementDir.Forward },
  { label: '后方', value: EDisplacementDir.Backward },
  { label: '左方', value: EDisplacementDir.Left },
  { label: '右方', value: EDisplacementDir.Right },
  { label: '朝向目标', value: EDisplacementDir.ToTarget },
  { label: '远离目标', value: EDisplacementDir.AwayFromTarget },
  { label: '自定义角度', value: EDisplacementDir.Custom },
]
const CURVE_OPTIONS = [
  { label: '匀速', value: EEaseCurve.Linear },
  { label: '先慢后快', value: EEaseCurve.EaseIn },
  { label: '先快后慢', value: EEaseCurve.EaseOut },
  { label: '慢快慢', value: EEaseCurve.EaseInOut },
]

interface Props { event: DisplacementEvent }

export function DisplacementEventPanel({ event }: Props) {
  const { updateEvent } = useEventStore.getState()
  const up = (patch: Partial<DisplacementEvent>) =>
    updateEvent(event.skillId, event.id, 'DisplacementEvent', patch as never)

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>位移事件</div>
      <div className={styles.row2}>
        <NumberInput label="开始时间 (s)" value={event.startTime} onChange={v => up({ startTime: v })} min={0} />
        <NumberInput label="结束时间 (s)" value={event.endTime} onChange={v => up({ endTime: v })} min={0} />
      </div>
      <EnumSelect label="位移方向" value={event.direction} options={DIR_OPTIONS} onChange={v => up({ direction: v })} />
      {event.direction === EDisplacementDir.Custom && (
        <NumberInput label="自定义角度 (deg)" value={event.customAngle} onChange={v => up({ customAngle: v })} />
      )}
      <NumberInput label="位移距离" value={event.distance} onChange={v => up({ distance: v })} min={0} />
      <EnumSelect label="速度曲线" value={event.curve} options={CURVE_OPTIONS} onChange={v => up({ curve: v })} />
      <div className={styles.checkField}>
        <span>穿透碰撞</span>
        <label className={styles.toggle}>
          <input type="checkbox" checked={event.ignoreCollision} onChange={e => up({ ignoreCollision: e.target.checked })} />
          忽略碰撞体
        </label>
      </div>
    </div>
  )
}
