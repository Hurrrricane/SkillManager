import { create } from 'zustand'
import { Skill, ESkillCategory, ECostType, ESkillTag } from '@/types'
import { nextId, ensureCounter } from '@/utils/idGen'

// Mock 数据：三连斩
const MOCK_SKILLS: Skill[] = [
  {
    id: 1001, name: '三连斩·壹', category: ESkillCategory.Normal,
    costType: ECostType.None, costValue: 0,
    costType2: ECostType.None, costValue2: 0,
    cooldown: 0, tags: ESkillTag.Melee, remark: '普攻第一段', skillDuration: 0.8,
  },
  {
    id: 1002, name: '三连斩·贰', category: ESkillCategory.Normal,
    costType: ECostType.None, costValue: 0,
    costType2: ECostType.None, costValue2: 0,
    cooldown: 0, tags: ESkillTag.Melee | ESkillTag.AoE, remark: '普攻第二段', skillDuration: 0.9,
  },
  {
    id: 1003, name: '三连斩·叁', category: ESkillCategory.Normal,
    costType: ECostType.None, costValue: 0,
    costType2: ECostType.None, costValue2: 0,
    cooldown: 0, tags: ESkillTag.Melee | ESkillTag.AoE, remark: '普攻第三段', skillDuration: 1.2,
  },
]

// 初始化 ID 计数器
MOCK_SKILLS.forEach(s => ensureCounter('skill', s.id))

interface SkillStore {
  skills: Skill[]
  selectedSkillId: number | null

  addSkill: (draft: Omit<Skill, 'id'>) => Skill
  updateSkill: (id: number, patch: Partial<Omit<Skill, 'id'>>) => void
  deleteSkill: (id: number) => void
  selectSkill: (id: number | null) => void
}

export const useSkillStore = create<SkillStore>((set, get) => ({
  skills: MOCK_SKILLS,
  selectedSkillId: 1001,

  addSkill: (draft) => {
    const skill: Skill = { id: nextId('skill'), ...draft }
    set(s => ({ skills: [...s.skills, skill] }))
    return skill
  },

  updateSkill: (id, patch) => {
    set(s => ({
      skills: s.skills.map(sk => sk.id === id ? { ...sk, ...patch } : sk),
    }))
  },

  deleteSkill: (id) => {
    set(s => ({
      skills: s.skills.filter(sk => sk.id !== id),
      selectedSkillId: s.selectedSkillId === id ? null : s.selectedSkillId,
    }))
  },

  selectSkill: (id) => set({ selectedSkillId: id }),
}))

/** 按 ID 查找技能（工具函数，在组件外使用）*/
export function getSkillById(id: number): Skill | undefined {
  return useSkillStore.getState().skills.find(s => s.id === id)
}
