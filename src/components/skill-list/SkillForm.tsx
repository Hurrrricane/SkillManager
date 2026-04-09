import { useState } from 'react'
import { Skill, ESkillCategory, ECostType, ESkillTag } from '@/types'
import { Modal } from '@/components/common/Modal'
import { EnumSelect } from '@/components/property-panel/fields/EnumSelect'
import { FlagsCheckbox } from '@/components/property-panel/fields/FlagsCheckbox'
import { NumberInput } from '@/components/property-panel/fields/NumberInput'
import styles from './SkillForm.module.css'

const CATEGORY_OPTIONS = [
  { label: '普通攻击', value: ESkillCategory.Normal },
  { label: '主动技能', value: ESkillCategory.Skill },
  { label: '大招', value: ESkillCategory.Ultimate },
  { label: '闪避', value: ESkillCategory.Dodge },
]

const COST_OPTIONS = [
  { label: '无', value: ECostType.None },
  { label: 'MP', value: ECostType.MP },
  { label: '能量', value: ECostType.Energy },
  { label: 'HP', value: ECostType.HP },
]

const TAG_OPTIONS = [
  { label: '近战', flag: ESkillTag.Melee },
  { label: '远程', flag: ESkillTag.Ranged },
  { label: '范围', flag: ESkillTag.AoE },
  { label: '弹道', flag: ESkillTag.Projectile },
  { label: '霸体', flag: ESkillTag.SuperArmor },
  { label: '无敌', flag: ESkillTag.Invincible },
]

const DEFAULT_SKILL: Omit<Skill, 'id'> = {
  name: '', category: ESkillCategory.Normal,
  costType: ECostType.None, costValue: 0,
  costType2: ECostType.None, costValue2: 0,
  cooldown: 0, tags: ESkillTag.None,
  remark: '', skillDuration: 1.0,
}

interface SkillFormProps {
  initial?: Skill
  onSubmit: (data: Omit<Skill, 'id'>) => void
  onClose: () => void
}

export function SkillForm({ initial, onSubmit, onClose }: SkillFormProps) {
  const [form, setForm] = useState<Omit<Skill, 'id'>>(
    initial ? { ...initial } : { ...DEFAULT_SKILL }
  )
  const [error, setError] = useState('')

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    if (!form.name.trim()) { setError('技能名称不能为空'); return }
    if (form.skillDuration <= 0) { setError('技能时长必须大于 0'); return }
    onSubmit(form)
  }

  return (
    <Modal title={initial ? '编辑技能' : '新建技能'} onClose={onClose} width={500}>
      <div className={styles.form}>
        <div className={styles.field}>
          <label>技能名称 *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="请输入技能名称" />
        </div>
        <EnumSelect label="技能分类" value={form.category} options={CATEGORY_OPTIONS} onChange={v => set('category', v)} />
        <div className={styles.row}>
          <EnumSelect label="消耗类型1" value={form.costType} options={COST_OPTIONS} onChange={v => set('costType', v)} />
          <NumberInput label="消耗值1" value={form.costValue} onChange={v => set('costValue', v)} min={0} step={1} disabled={form.costType === ECostType.None} />
        </div>
        <div className={styles.row}>
          <EnumSelect label="消耗类型2" value={form.costType2} options={COST_OPTIONS} onChange={v => set('costType2', v)} />
          <NumberInput label="消耗值2" value={form.costValue2} onChange={v => set('costValue2', v)} min={0} step={1} disabled={form.costType2 === ECostType.None} />
        </div>
        <NumberInput label="冷却时间 (秒)" value={form.cooldown} onChange={v => set('cooldown', v)} min={0} />
        <NumberInput label="技能时长 (秒) *" value={form.skillDuration} onChange={v => set('skillDuration', v)} min={0.1} />
        <FlagsCheckbox label="技能标签" value={form.tags} options={TAG_OPTIONS} onChange={v => set('tags', v)} />
        <div className={styles.field}>
          <label>备注</label>
          <textarea value={form.remark} onChange={e => set('remark', e.target.value)} rows={2} />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>取消</button>
          <button className={styles.submit} onClick={handleSubmit}>确认</button>
        </div>
      </div>
    </Modal>
  )
}
