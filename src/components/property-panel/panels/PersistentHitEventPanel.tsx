import { PersistentHitEvent, EHitShape, EPersistentHitSubType } from '@/types'
import { useEventStore } from '@/store'
import { NumberInput } from '../fields/NumberInput'
import { EnumSelect } from '../fields/EnumSelect'
import { ShapePreview } from './ShapePreview'
import styles from './Panel.module.css'

const SUBTYPE_OPTIONS = [
  { label: '波动式 Wave',  value: EPersistentHitSubType.Wave  },
  { label: '持续场 Field', value: EPersistentHitSubType.Field },
]
const SHAPE_OPTIONS = [
  { label: '圆形 Circle',    value: EHitShape.Circle    },
  { label: '矩形 Rectangle', value: EHitShape.Rectangle },
  { label: '扇形 Fan',       value: EHitShape.Fan       },
]
const SHAPE_P2_LABEL: Partial<Record<EHitShape, string>> = {
  [EHitShape.Rectangle]: '半高',
  [EHitShape.Fan]:       '角度 (deg)',
}

interface Props { event: PersistentHitEvent }

export function PersistentHitEventPanel({ event }: Props) {
  const { updateEvent } = useEventStore.getState()
  const up = (patch: Partial<PersistentHitEvent>) =>
    updateEvent(event.skillId, event.id, 'PersistentHitEvent', patch as never)

  const isWave  = event.subType === EPersistentHitSubType.Wave
  const showP2  = event.shape !== EHitShape.Circle
  const p2Label = SHAPE_P2_LABEL[event.shape] ?? ''

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>持续 Hit 事件</div>

      <ShapePreview
        shape={event.shape}
        offsetX={event.offsetX}
        offsetY={event.offsetY}
        shapeParam1={event.shapeParam1}
        shapeParam2={event.shapeParam2}
        showWaveArrow={isWave}
      />

      <div className={styles.row2}>
        <NumberInput label="开始时间 (s)" value={event.startTime} onChange={v => up({ startTime: v })} min={0} />
        <NumberInput label="结束时间 (s)" value={event.endTime}   onChange={v => up({ endTime: v })}   min={0} />
      </div>

      <EnumSelect label="子类型" value={event.subType} options={SUBTYPE_OPTIONS} onChange={v => up({ subType: v })} />

      <div className={styles.section}>判定体</div>
      <EnumSelect label="形状" value={event.shape} options={SHAPE_OPTIONS} onChange={v => up({ shape: v })} />
      <div className={styles.row2}>
        <NumberInput label="偏移 X" value={event.offsetX} onChange={v => up({ offsetX: v })} />
        <NumberInput label="偏移 Y" value={event.offsetY} onChange={v => up({ offsetY: v })} />
      </div>
      <NumberInput label="半径 / 半宽" value={event.shapeParam1} onChange={v => up({ shapeParam1: v })} min={0} />
      {showP2 && <NumberInput label={p2Label} value={event.shapeParam2} onChange={v => up({ shapeParam2: v })} min={0} />}

      {isWave ? (
        <>
          <div className={styles.section}>Wave 参数</div>
          <NumberInput label="速度 (u/s)" value={event.speed} onChange={v => up({ speed: v })} min={0} />
          <div className={styles.checkField}>
            <span>命中销毁</span>
            <label className={styles.toggle}>
              <input type="checkbox" checked={event.destroyOnHit}
                onChange={e => up({ destroyOnHit: e.target.checked })} />
              销毁
            </label>
          </div>
        </>
      ) : (
        <>
          <div className={styles.section}>Field 参数</div>
          <NumberInput label="命中间隔 (s)" value={event.hitInterval}      onChange={v => up({ hitInterval: v })}      min={0} />
          <NumberInput label="每目标上限"   value={event.maxHitsPerTarget} onChange={v => up({ maxHitsPerTarget: Math.round(v) })} min={0} step={1} />
        </>
      )}

      <div className={styles.section}>战斗数值</div>
      <NumberInput label="伤害"         value={event.damage}      onChange={v => up({ damage: v })}      min={0} step={1} />
      <NumberInput label="僵直时间 (s)" value={event.stagger}     onChange={v => up({ stagger: v })}     min={0} />
      <NumberInput label="击退距离"     value={event.knockback}   onChange={v => up({ knockback: v })}   min={0} />
      <NumberInput label="削韧值"       value={event.poiseDamage} onChange={v => up({ poiseDamage: v })} min={0} />
      <NumberInput label="顿帧时间 (s)" value={event.hitStop}     onChange={v => up({ hitStop: v })}     min={0} />
    </div>
  )
}
