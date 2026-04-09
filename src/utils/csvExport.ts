import {
  Skill, AnyEvent,
  ESkillCategory, ECostType, ESkillTag,
  EHitShape, EPersistentHitSubType, EBuffTarget, EResourceType,
  EDisplacementDir, EEaseCurve, ECameraType, EStateFlag,
  AnimEvent, HitEvent, PersistentHitEvent, BuffEvent, ResourceEvent,
  VFXEvent, SFXEvent, DeriveEvent,
  DisplacementEvent, StateEvent, LoopEvent, CameraEvent,
} from '@/types'
import { serializeFlags } from './flagsUtils'

function escapeCell(c: string | number | boolean): string {
  const s = String(c)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function toRow(cells: (string | number | boolean)[]): string {
  return cells.map(escapeCell).join(',')
}

function buildCsv(
  headers: string[], types: string[], comments: string[],
  rows: (string | number | boolean)[][],
): string {
  return [
    toRow(['##', ...headers]),
    toRow(['##', ...types]),
    toRow(['##', ...comments]),
    ...rows.map(r => toRow(['', ...r])),
  ].join('\r\n') + '\r\n'
}

function byKind<T extends AnyEvent>(events: AnyEvent[], kind: T['kind']): T[] {
  return events.filter(e => e.kind === kind) as T[]
}

export function exportSkills(skills: Skill[]): string {
  return buildCsv(
    ['id','name','category','costType','costValue','costType2','costValue2','cooldown','tags','remark','skillDuration'],
    ['int','string','ESkillCategory','ECostType','int','ECostType','int','float','ESkillTag#flags','string','float'],
    ['技能ID','名称','分类','消耗类型','消耗值','消耗类型2','消耗值2','冷却','标签','备注','时长'],
    skills.map(s => [
      s.id, s.name,
      ESkillCategory[s.category], ECostType[s.costType], s.costValue,
      ECostType[s.costType2], s.costValue2, s.cooldown,
      serializeFlags(s.tags, ESkillTag as unknown as Record<string, number>),
      s.remark, s.skillDuration,
    ]),
  )
}

export function exportEvents(events: AnyEvent[]): Record<string, string> {
  const out: Record<string, string> = {}

  out['derive_event.csv'] = buildCsv(
    ['id','skillId','targetSkillIds','deriveStart','deriveEnd','enablePreInput','preInputPoint'],
    ['int','int','list#sep=;,int','float','float','bool','float'],
    ['ID','技能ID','目标技能ID','派生起点','派生终点','预输入','预输入点'],
    byKind<DeriveEvent>(events,'DeriveEvent').map(e=>[
      e.id,e.skillId,e.targetSkillIds.join(';'),e.deriveStart,e.deriveEnd,e.enablePreInput,e.preInputPoint,
    ]),
  )
  out['anim_event.csv'] = buildCsv(
    ['id','skillId','triggerTime','animName'],
    ['int','int','float','string'],
    ['ID','技能ID','触发时间','动画名称'],
    byKind<AnimEvent>(events,'AnimEvent').map(e=>[e.id,e.skillId,e.triggerTime,e.animName]),
  )
  out['hit_event.csv'] = buildCsv(
    ['id','skillId','triggerTime','shape','offsetX','offsetY','shapeParam1','shapeParam2','damage','stagger','knockback','poiseDamage','comboCount','hitStop'],
    ['int','int','float','EHitShape','float','float','float','float','int','float','float','float','int','float'],
    ['ID','技能ID','触发时间','形状','偏移X','偏移Y','参数1','参数2','伤害','僵直','击退','削韧','连击','顿帧'],
    byKind<HitEvent>(events,'HitEvent').map(e=>[
      e.id,e.skillId,e.triggerTime,EHitShape[e.shape],
      e.offsetX,e.offsetY,e.shapeParam1,e.shapeParam2,
      e.damage,e.stagger,e.knockback,e.poiseDamage,e.comboCount,e.hitStop,
    ]),
  )
  out['persistent_hit_event.csv'] = buildCsv(
    ['id','skillId','startTime','endTime','subType','shape','offsetX','offsetY','shapeParam1','shapeParam2','speed','hitLength','destroyOnHit','hitInterval','maxHitsPerTarget','damage','stagger','knockback','poiseDamage','hitStop'],
    ['int','int','float','float','EPersistentHitSubType','EHitShape','float','float','float','float','float','float','bool','float','int','int','float','float','float','float'],
    ['ID','技能ID','开始','结束','子类型','形状','偏移X','偏移Y','参数1','参数2','速度','判定区长度','命中销毁','命中间隔','每目标上限','伤害','僵直','击退','削韧','顿帧'],
    byKind<PersistentHitEvent>(events,'PersistentHitEvent').map(e=>[
      e.id,e.skillId,e.startTime,e.endTime,
      EPersistentHitSubType[e.subType],EHitShape[e.shape],
      e.offsetX,e.offsetY,e.shapeParam1,e.shapeParam2,
      e.speed,e.hitLength,e.destroyOnHit,e.hitInterval,e.maxHitsPerTarget,
      e.damage,e.stagger,e.knockback,e.poiseDamage,e.hitStop,
    ]),
  )
  out['buff_event.csv'] = buildCsv(
    ['id','skillId','triggerTime','buffId','target','duration','stackCount'],
    ['int','int','float','int','EBuffTarget','float','int'],
    ['ID','技能ID','触发时间','BuffID','目标','持续时间','层数'],
    byKind<BuffEvent>(events,'BuffEvent').map(e=>[
      e.id,e.skillId,e.triggerTime,e.buffId,EBuffTarget[e.target],e.duration,e.stackCount,
    ]),
  )
  out['resource_event.csv'] = buildCsv(
    ['id','skillId','triggerTime','resourceType','value','isPercent'],
    ['int','int','float','EResourceType','int','bool'],
    ['ID','技能ID','触发时间','资源类型','回复量','百分比'],
    byKind<ResourceEvent>(events,'ResourceEvent').map(e=>[
      e.id,e.skillId,e.triggerTime,EResourceType[e.resourceType],e.value,e.isPercent,
    ]),
  )
  out['vfx_event.csv'] = buildCsv(
    ['id','skillId','triggerTime','effectId','attachPoint','offsetX','offsetY','offsetZ','rotation','scale','duration','followChar'],
    ['int','int','float','string','string','float','float','float','float','float','float','bool'],
    ['ID','技能ID','触发时间','特效ID','挂点','X','Y','Z','旋转','缩放','存活时间','跟随'],
    byKind<VFXEvent>(events,'VFXEvent').map(e=>[
      e.id,e.skillId,e.triggerTime,e.effectId,e.attachPoint,
      e.offsetX,e.offsetY,e.offsetZ,e.rotation,e.scale,e.duration,e.followChar,
    ]),
  )
  out['sfx_event.csv'] = buildCsv(
    ['id','skillId','triggerTime','audioId','volume','loop','stopTime'],
    ['int','int','float','string','float','bool','float'],
    ['ID','技能ID','触发时间','音效ID','音量','循环','停止时间'],
    byKind<SFXEvent>(events,'SFXEvent').map(e=>[
      e.id,e.skillId,e.triggerTime,e.audioId,e.volume,e.loop,e.stopTime,
    ]),
  )
  out['displacement_event.csv'] = buildCsv(
    ['id','skillId','startTime','endTime','direction','customAngle','distance','curve','ignoreCollision'],
    ['int','int','float','float','EDisplacementDir','float','float','EEaseCurve','bool'],
    ['ID','技能ID','开始','结束','方向','自定义角度','距离','曲线','穿透碰撞'],
    byKind<DisplacementEvent>(events,'DisplacementEvent').map(e=>[
      e.id,e.skillId,e.startTime,e.endTime,
      EDisplacementDir[e.direction],e.customAngle,e.distance,EEaseCurve[e.curve],e.ignoreCollision,
    ]),
  )
  out['state_event.csv'] = buildCsv(
    ['id','skillId','startTime','endTime','stateFlags'],
    ['int','int','float','float','EStateFlag#flags'],
    ['ID','技能ID','开始','结束','状态标记'],
    byKind<StateEvent>(events,'StateEvent').map(e=>[
      e.id,e.skillId,e.startTime,e.endTime,
      serializeFlags(e.stateFlags, EStateFlag as unknown as Record<string, number>),
    ]),
  )
  out['loop_event.csv'] = buildCsv(
    ['id','skillId','startTime','endTime','maxDuration'],
    ['int','int','float','float','float'],
    ['ID','技能ID','循环起点','循环终点','最大总时长'],
    byKind<LoopEvent>(events,'LoopEvent').map(e=>[e.id,e.skillId,e.startTime,e.endTime,e.maxDuration]),
  )
  out['camera_event.csv'] = buildCsv(
    ['id','skillId','startTime','endTime','cameraType','intensity','curve'],
    ['int','int','float','float','ECameraType','float','EEaseCurve'],
    ['ID','技能ID','开始','结束','类型','强度','曲线'],
    byKind<CameraEvent>(events,'CameraEvent').map(e=>[
      e.id,e.skillId,e.startTime,e.endTime,ECameraType[e.cameraType],e.intensity,EEaseCurve[e.curve],
    ]),
  )
  return out
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export async function downloadAllAsZip(skills: Skill[], events: AnyEvent[]): Promise<void> {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  zip.file('skill.csv', '\ufeff' + exportSkills(skills))
  for (const [name, content] of Object.entries(exportEvents(events))) {
    zip.file(name, '\ufeff' + content)
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'skill_data.zip'; a.click()
  URL.revokeObjectURL(url)
}
