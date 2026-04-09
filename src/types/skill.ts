import { ECostType, ESkillCategory, ESkillTag } from './enums'

export interface Skill {
  id: number
  name: string
  category: ESkillCategory
  costType: ECostType
  costValue: number
  costType2: ECostType
  costValue2: number
  cooldown: number
  tags: ESkillTag
  remark: string
  skillDuration: number
}
