import { useState } from 'react'
import { useSkillStore } from '@/store'
import { Skill, ESkillCategory } from '@/types'
import { SkillForm } from './SkillForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import styles from './SkillList.module.css'

const CATEGORY_LABEL: Record<ESkillCategory, string> = {
  [ESkillCategory.Normal]:   '普攻',
  [ESkillCategory.Skill]:    '技能',
  [ESkillCategory.Ultimate]: '大招',
  [ESkillCategory.Dodge]:    '闪避',
}

const CATEGORY_COLOR: Record<ESkillCategory, string> = {
  [ESkillCategory.Normal]:   '#3A7BD5',
  [ESkillCategory.Skill]:    '#27AE60',
  [ESkillCategory.Ultimate]: '#E74C3C',
  [ESkillCategory.Dodge]:    '#F39C12',
}

export function SkillList() {
  const { skills, selectedSkillId, addSkill, updateSkill, deleteSkill, selectSkill } = useSkillStore()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<ESkillCategory | -1>(-1)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Skill | null>(null)
  const [deleting, setDeleting] = useState<Skill | null>(null)

  const filtered = skills.filter(s => {
    const matchSearch = s.name.includes(search) || String(s.id).includes(search)
    const matchCat = filterCat === -1 || s.category === filterCat
    return matchSearch && matchCat
  })

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <span className={styles.title}>技能列表</span>
        <button className={styles.addBtn} onClick={() => setCreating(true)} title="新建技能">＋</button>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.search}
          placeholder="搜索名称/ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.catFilter}
          value={filterCat}
          onChange={e => setFilterCat(Number(e.target.value) as ESkillCategory | -1)}
        >
          <option value={-1}>全部</option>
          <option value={ESkillCategory.Normal}>普攻</option>
          <option value={ESkillCategory.Skill}>技能</option>
          <option value={ESkillCategory.Ultimate}>大招</option>
          <option value={ESkillCategory.Dodge}>闪避</option>
        </select>
      </div>

      <div className={styles.list}>
        {filtered.length === 0 && (
          <div className={styles.empty}>暂无技能</div>
        )}
        {filtered.map(skill => (
          <div
            key={skill.id}
            className={`${styles.item} ${skill.id === selectedSkillId ? styles.selected : ''}`}
            onClick={() => selectSkill(skill.id)}
          >
            <span
              className={styles.badge}
              style={{ background: CATEGORY_COLOR[skill.category] }}
            >
              {CATEGORY_LABEL[skill.category]}
            </span>
            <div className={styles.info}>
              <span className={styles.name}>{skill.name}</span>
              <span className={styles.meta}>#{skill.id} · {skill.skillDuration}s</span>
            </div>
            <div className={styles.actions}>
              <button
                className={styles.actionBtn}
                title="编辑"
                onClick={e => { e.stopPropagation(); setEditing(skill) }}
              >✎</button>
              <button
                className={`${styles.actionBtn} ${styles.danger}`}
                title="删除"
                onClick={e => { e.stopPropagation(); setDeleting(skill) }}
              >✕</button>
            </div>
          </div>
        ))}
      </div>

      {creating && (
        <SkillForm
          onSubmit={data => { addSkill(data); setCreating(false) }}
          onClose={() => setCreating(false)}
        />
      )}
      {editing && (
        <SkillForm
          initial={editing}
          onSubmit={data => { updateSkill(editing.id, data); setEditing(null) }}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          message={`确认删除技能「${deleting.name}」？此操作不可撤销。`}
          onConfirm={() => { deleteSkill(deleting.id); setDeleting(null) }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
