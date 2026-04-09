import { useState } from 'react'
import { useSkillStore, useEventStore } from '@/store'
import { AnyEvent, ESkillCategory, ECostType, ESkillTag, EHitShape, EPersistentHitSubType, EDisplacementDir, EEaseCurve, ECameraType, EStateFlag, EBuffTarget, EResourceType } from '@/types'
import { EnumSelect } from './fields/EnumSelect'
import { FlagsCheckbox } from './fields/FlagsCheckbox'
import { NumberInput } from './fields/NumberInput'
import styles from './SkillPropertiesPanel.module.css'

// ── 枚举选项 ────────────────────────────────────────────────
const CAT_OPTS = [
  { label: '普通攻击', value: ESkillCategory.Normal },
  { label: '主动技能', value: ESkillCategory.Skill },
  { label: '大招',     value: ESkillCategory.Ultimate },
  { label: '闪避',     value: ESkillCategory.Dodge },
]
const COST_OPTS = [
  { label: '无', value: ECostType.None },
  { label: 'MP', value: ECostType.MP },
  { label: '能量', value: ECostType.Energy },
  { label: 'HP', value: ECostType.HP },
]
const TAG_OPTS = [
  { label: '近战', flag: ESkillTag.Melee },
  { label: '远程', flag: ESkillTag.Ranged },
  { label: '范围', flag: ESkillTag.AoE },
  { label: '弹道', flag: ESkillTag.Projectile },
  { label: '霸体', flag: ESkillTag.SuperArmor },
  { label: '无敌', flag: ESkillTag.Invincible },
]

// ── 事件类型列表（用于添加按钮）────────────────────────────
const EVENT_TYPES: { label: string; kind: AnyEvent['kind']; color: string }[] = [
  { label: 'Hit',    kind: 'HitEvent',           color: '#E74C3C' },
  { label: '持续Hit', kind: 'PersistentHitEvent', color: '#FF7675' },
  { label: '位移',  kind: 'DisplacementEvent', color: '#E67E22' },
  { label: '状态',  kind: 'StateEvent',        color: '#2ECC71' },
  { label: '资源',  kind: 'ResourceEvent',     color: '#27AE60' },
  { label: 'Buff',  kind: 'BuffEvent',         color: '#F39C12' },
  { label: '派生',  kind: 'DeriveEvent',       color: '#7C5CBF' },
  { label: '动画',  kind: 'AnimEvent',         color: '#3A7BD5' },
  { label: 'VFX',   kind: 'VFXEvent',          color: '#1ABC9C' },
  { label: 'SFX',   kind: 'SFXEvent',          color: '#9B59B6' },
  { label: '镜头',  kind: 'CameraEvent',       color: '#8E44AD' },
  { label: '循环',  kind: 'LoopEvent',         color: '#16A085' },
]

function makeDefaultEvent(kind: AnyEvent['kind'], skillId: number, allEvents: AnyEvent[]): Omit<AnyEvent, 'id'> {
  const sameKind = allEvents.filter(e => e.kind === kind)
  let lastEnd = 0
  for (const e of sameKind) {
    if ('triggerTime' in e) lastEnd = Math.max(lastEnd, (e as { triggerTime: number }).triggerTime)
    else if ('deriveEnd' in e) lastEnd = Math.max(lastEnd, (e as { deriveEnd: number }).deriveEnd)
    else if ('endTime' in e) lastEnd = Math.max(lastEnd, (e as { endTime: number }).endTime)
  }
  const pt = parseFloat((lastEnd + 0.5).toFixed(2))
  const ds = parseFloat((lastEnd + 0.5).toFixed(2))
  const de = parseFloat((lastEnd + 1.0).toFixed(2))

  switch (kind) {
    case 'AnimEvent':         return { kind, skillId, triggerTime: pt,  animName: 'new_anim' }
    case 'HitEvent':           return { kind, skillId, triggerTime: pt,  shape: EHitShape.Fan, offsetX: 0, offsetY: 1, shapeParam1: 2, shapeParam2: 90, damage: 100, stagger: 0.3, knockback: 0.5, poiseDamage: 10, comboCount: 1, hitStop: 0.05 }
    case 'PersistentHitEvent': return { kind, skillId, startTime: ds, endTime: de, subType: EPersistentHitSubType.Wave, shape: EHitShape.Circle, offsetX: 0, offsetY: 0.5, shapeParam1: 0.4, shapeParam2: 0, speed: 8, destroyOnHit: true, hitInterval: 0, maxHitsPerTarget: 0, damage: 80, stagger: 0.1, knockback: 0.3, poiseDamage: 5, hitStop: 0.03 }
    case 'BuffEvent':         return { kind, skillId, triggerTime: pt,  buffId: 1, target: EBuffTarget.Self, duration: 0, stackCount: 1 }
    case 'ResourceEvent':     return { kind, skillId, triggerTime: pt,  resourceType: EResourceType.Energy, value: 10, isPercent: false }
    case 'VFXEvent':          return { kind, skillId, triggerTime: pt,  effectId: 'vfx_new', attachPoint: '', offsetX: 0, offsetY: 0, offsetZ: 0, rotation: 0, scale: 1, duration: 0, followChar: true }
    case 'SFXEvent':          return { kind, skillId, triggerTime: pt,  audioId: 'sfx_new', volume: 1, loop: false, stopTime: 0 }
    case 'DeriveEvent':       return { kind, skillId, targetSkillIds: [], deriveStart: ds, deriveEnd: de, enablePreInput: false, preInputPoint: 0 }
    case 'DisplacementEvent': return { kind, skillId, startTime: ds, endTime: de, direction: EDisplacementDir.Forward, customAngle: 0, distance: 2, curve: EEaseCurve.EaseOut, ignoreCollision: false }
    case 'StateEvent':        return { kind, skillId, startTime: ds, endTime: de, stateFlags: EStateFlag.SuperArmor }
    case 'LoopEvent':         return { kind, skillId, startTime: ds, endTime: de, maxDuration: 0 }
    case 'CameraEvent':       return { kind, skillId, startTime: ds, endTime: de, cameraType: ECameraType.Shake, intensity: 0.2, curve: EEaseCurve.EaseOut }
  }
}

export function SkillPropertiesPanel() {
  const { skills, selectedSkillId, updateSkill } = useSkillStore()
  const events = useEventStore(s => selectedSkillId ? (s.index[selectedSkillId] ?? []) : [])
  const [showAddMenu, setShowAddMenu] = useState(false)

  const skill = skills.find(s => s.id === selectedSkillId)
  if (!skill) return null

  const up = <K extends keyof typeof skill>(k: K, v: typeof skill[K]) =>
    updateSkill(skill.id, { [k]: v })

  const handleAddEvent = (kind: AnyEvent['kind']) => {
    useEventStore.getState().addEvent(makeDefaultEvent(kind, skill.id, events))
    setShowAddMenu(false)
  }

  return (
    <div className={styles.container}>
      {/* 添加事件 */}
      <div className={styles.addSection}>
        <button
          className={styles.addBtn}
          onClick={() => setShowAddMenu(v => !v)}
        >
          ＋ 添加事件
        </button>
        {showAddMenu && (
          <div className={styles.addMenu}>
            {EVENT_TYPES.map(et => (
              <button
                key={et.kind}
                className={styles.addMenuItem}
                style={{ borderLeft: `3px solid ${et.color}` }}
                onClick={() => handleAddEvent(et.kind)}
              >
                {et.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 技能基础属性 */}
      <div className={styles.section}>基础属性</div>

      <div className={styles.field}>
        <label>技能名称</label>
        <input value={skill.name} onChange={e => up('name', e.target.value)} />
      </div>

      <EnumSelect label="技能分类" value={skill.category} options={CAT_OPTS} onChange={v => up('category', v)} />

      <div className={styles.row2}>
        <EnumSelect label="消耗类型1" value={skill.costType} options={COST_OPTS} onChange={v => up('costType', v)} />
        <NumberInput label="消耗值1" value={skill.costValue} onChange={v => up('costValue', v)} min={0} step={1} disabled={skill.costType === ECostType.None} />
      </div>
      <div className={styles.row2}>
        <EnumSelect label="消耗类型2" value={skill.costType2} options={COST_OPTS} onChange={v => up('costType2', v)} />
        <NumberInput label="消耗值2" value={skill.costValue2} onChange={v => up('costValue2', v)} min={0} step={1} disabled={skill.costType2 === ECostType.None} />
      </div>

      <NumberInput label="冷却时间 (s)" value={skill.cooldown} onChange={v => up('cooldown', v)} min={0} />
      <NumberInput label="技能时长 (s)" value={skill.skillDuration} onChange={v => up('skillDuration', Math.max(0.01, v))} min={0.01} step={0.01} />

      <FlagsCheckbox label="技能标签" value={skill.tags} options={TAG_OPTS} onChange={v => up('tags', v)} />

      <div className={styles.field}>
        <label>备注</label>
        <textarea value={skill.remark} onChange={e => up('remark', e.target.value)} rows={2} />
      </div>

      <div className={styles.idNote}>技能 ID: #{skill.id}</div>
    </div>
  )
}
