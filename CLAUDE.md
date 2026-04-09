# SkillManager - 技能编辑器

## 项目概述

Unity 动作游戏的 Web 端技能编辑器，供策划使用。核心功能：
- 时间轴编辑：可视化摆放/拖拽技能事件
- 俯视图预览：实时显示攻击范围示意
- CSV 导出：输出 Luban 兼容的配置文件供 Unity 消费

## 技术栈

- TypeScript + React + Vite
- Canvas 2D 自绘时间轴和俯视图

## 数据结构

详细定义见 `docs/data-structure.md`（Luban Schema 格式）。

### 表结构 (12 张表)

| 表 | 类型 | 说明 |
|---|---|---|
| TbSkill | 主表 | 技能基础属性，无事件引用 |
| TbDeriveEvent | 特殊事件 | 派生窗口 + 目标技能列表 |
| TbAnimEvent | 点事件 | 动画切换点（triggerTime + animName）|
| TbHitEvent | 点事件 | 伤害判定（形状/数值/顿帧）|
| TbBuffEvent | 点事件 | Buff 施加 |
| TbResourceEvent | 点事件 | 资源回复 |
| TbVFXEvent | 点事件 | 特效 |
| TbSFXEvent | 点事件 | 音效 |
| TbDisplacementEvent | 持续事件 | 位移（方向/距离/曲线）|
| TbStateEvent | 持续事件 | 状态标记（霸体/无敌等）|
| TbLoopEvent | 持续事件 | 蓄力/循环区间 |
| TbCameraEvent | 持续事件 | 镜头效果 |

### 事件引用机制

**单向引用：事件 → 技能。** 所有事件表通过 `skillId` 指向 TbSkill，Skill 表不持有任何事件引用。运行时/编辑器加载后按 `skillId` 建反查索引。ID 在各表内自增，跨表独立。

### 时间轴

- 轴起点 = 0
- 轴终点 = `max(skillDuration, max(所有 DeriveEvent.deriveEnd))`
- 无派生事件时轴终点 = skillDuration
- 轨道按事件类型分行显示

### 关键设计决策

- **AnimEvent 是点事件**：`{id, skillId, triggerTime, animName}`，t=0 为起始动画
- **TbSkill 纯基础属性**：无 deriveDuration、无 animations、无 derives、无 eventRefs，所有事件通过 skillId 反向关联
- **DeriveEvent 含 targetSkillIds**：派生路由信息在事件自身，不在 Skill 表
- **EStateFlag 打断免疫**：拆分为 DodgeCancelImmune(4) 和 SkillCancelImmune(8)，替代笼统的 Uncancellable
- **LoopEvent**：蓄力等级通过派生系统实现，不需要额外机制

## 开发规范

- 数据结构变更需先更新 `docs/data-structure.md`，再改代码
- 枚举值用 Luban 风格：普通枚举顺序递增，Flag 枚举用 2 的幂次
- CSV 分隔符和嵌套格式遵循 Luban 默认约定
