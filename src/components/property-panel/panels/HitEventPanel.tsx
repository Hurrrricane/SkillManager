import { HitEvent, EHitShape } from '@/types'
import { useEventStore } from '@/store'
import { NumberInput } from '../fields/NumberInput'
import { EnumSelect } from '../fields/EnumSelect'
import { HitRangePreview } from './HitRangePreview'
import styles from './Panel.module.css'

const SHAPE_OPTIONS = [
  { label: '圆形 Circle',    value: EHitShape.Circle },
  { label: '矩形 Rectangle', value: EHitShape.Rectangle },
  { label: '扇形 Fan',       value: EHitShape.Fan },
]

const SHAPE_PARAM_LABELS: Record<EHitShape, [string, string]> = {
  [EHitShape.Circle]:    ['半径',   ''],
  [EHitShape.Rectangle]: ['半宽',   '半高'],
  [EHitShape.Fan]:       ['半径',   '角度 (deg)'],
}

interface Props { event: HitEvent }

export function HitEventPanel({ event }: Props) {
  const { updateEvent } = useEventStore.getState()
  const up = (patch: Partial<HitEvent>) => updateEvent(event.skillId, event.id, 'HitEvent', patch as never)

  const [p1Label, p2Label] = SHAPE_PARAM_LABELS[event.shape]
  const showP2 = event.shape !== EHitShape.Circle

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>Hit 事件</div>

      {/* 预览图 */}
      <HitRangePreview event={event} />

      <NumberInput label="触发时间 (s)" value={event.triggerTime} onChange={v => up({ triggerTime: v })} min={0} />

      <div className={styles.section}>攻击形状</div>
      <EnumSelect label="形状" value={event.shape} options={SHAPE_OPTIONS} onChange={v => up({ shape: v })} />
      <div className={styles.row2}>
        <NumberInput label="偏移 X" value={event.offsetX} onChange={v => up({ offsetX: v })} />
        <NumberInput label="偏移 Y" value={event.offsetY} onChange={v => up({ offsetY: v })} />
      </div>
      <NumberInput label={p1Label} value={event.shapeParam1} onChange={v => up({ shapeParam1: v })} min={0} />
      {showP2 && <NumberInput label={p2Label} value={event.shapeParam2} onChange={v => up({ shapeParam2: v })} min={0} />}

      <div className={styles.section}>战斗数值</div>
      <NumberInput label="伤害"         value={event.damage}      onChange={v => up({ damage: v })}      min={0} step={1} />
      <NumberInput label="僵直时间 (s)" value={event.stagger}     onChange={v => up({ stagger: v })}     min={0} />
      <NumberInput label="击退距离"     value={event.knockback}   onChange={v => up({ knockback: v })}   min={0} />
      <NumberInput label="削韧值"       value={event.poiseDamage} onChange={v => up({ poiseDamage: v })} min={0} />
      <NumberInput label="连击数"       value={event.comboCount}  onChange={v => up({ comboCount: v })}  min={1} step={1} />
      <NumberInput label="顿帧时间 (s)" value={event.hitStop}     onChange={v => up({ hitStop: v })}     min={0} />
    </div>
  )
}
