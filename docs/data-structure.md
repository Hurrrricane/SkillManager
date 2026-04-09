# 技能编辑器 - 数据结构定义 v1 (Luban Schema)

---

## 一、枚举 (Enum)

### ESkillCategory - 技能分类
```xml
<enum name="ESkillCategory">
    <var name="Normal"       value="0" comment="普通攻击"/>
    <var name="Skill"        value="1" comment="主动技能"/>
    <var name="Ultimate"     value="2" comment="大招"/>
    <var name="Dodge"        value="3" comment="闪避"/>
</enum>
```

### ECostType - 消耗类型
```xml
<enum name="ECostType">
    <var name="None"    value="0" comment="无消耗"/>
    <var name="MP"      value="1" comment="魔法值"/>
    <var name="Energy"  value="2" comment="能量"/>
    <var name="HP"      value="3" comment="生命值"/>
</enum>
```

### ESkillTag - 技能标签 (Flag 复选枚举)
```xml
<enum name="ESkillTag" flags="true">
    <var name="None"          value="0"/>
    <var name="Melee"         value="1"  comment="近战"/>
    <var name="Ranged"        value="2"  comment="远程"/>
    <var name="AoE"           value="4"  comment="范围"/>
    <var name="Projectile"    value="8"  comment="弹道"/>
    <var name="SuperArmor"    value="16" comment="霸体"/>
    <var name="Invincible"    value="32" comment="无敌"/>
</enum>
```

### EHitShape - 攻击形状
```xml
<enum name="EHitShape">
    <var name="Circle"    value="0" comment="圆形"/>
    <var name="Rectangle" value="1" comment="矩形"/>
    <var name="Fan"       value="2" comment="扇形"/>
    <var name="Ring"      value="3" comment="环形"/>
</enum>
```

### EEventType - 事件类型
> 用于运行时/编辑器按 skillId 反查时区分事件所属的表

```xml
<enum name="EEventType">
    <var name="Derive"            value="0"  comment="派生事件"/>
    <var name="Hit"               value="1"  comment="伤害事件"/>
    <var name="Buff"              value="2"  comment="Buff事件"/>
    <var name="ResourceRecovery"  value="3"  comment="资源回复事件"/>
    <var name="VFX"               value="4"  comment="特效事件"/>
    <var name="SFX"               value="5"  comment="音效事件"/>
    <var name="Camera"            value="6"  comment="镜头事件"/>
    <var name="Anim"              value="7"  comment="动画事件"/>
    <var name="Displacement"      value="11" comment="位移事件"/>
    <var name="State"             value="12" comment="状态事件"/>
    <var name="Loop"              value="13" comment="循环事件"/>
</enum>
```

### EBuffTarget - Buff 目标
```xml
<enum name="EBuffTarget">
    <var name="Self"    value="0" comment="施加给自身"/>
    <var name="Enemy"   value="1" comment="施加给命中目标"/>
</enum>
```

### EResourceType - 资源类型
> 复用消耗类型枚举，回复的资源种类与消耗对称

```xml
<enum name="EResourceType">
    <var name="HP"      value="1" comment="生命值"/>
    <var name="MP"      value="2" comment="魔法值"/>
    <var name="Energy"  value="3" comment="能量"/>
</enum>
```

### EDisplacementDir - 位移方向
```xml
<enum name="EDisplacementDir">
    <var name="Forward"        value="0" comment="角色朝向前方"/>
    <var name="Backward"       value="1" comment="角色朝向后方"/>
    <var name="Left"           value="2" comment="角色左方"/>
    <var name="Right"          value="3" comment="角色右方"/>
    <var name="ToTarget"       value="4" comment="朝向锁定目标"/>
    <var name="AwayFromTarget" value="5" comment="远离锁定目标"/>
    <var name="Custom"         value="6" comment="自定义角度"/>
</enum>
```

### EEaseCurve - 速度曲线
```xml
<enum name="EEaseCurve">
    <var name="Linear"    value="0" comment="匀速"/>
    <var name="EaseIn"    value="1" comment="先慢后快"/>
    <var name="EaseOut"   value="2" comment="先快后慢"/>
    <var name="EaseInOut" value="3" comment="慢-快-慢"/>
</enum>
```

### EStateFlag - 状态标记 (Flag 复选枚举)
> 持续事件期间附加的状态效果，可叠加

```xml
<enum name="EStateFlag" flags="true">
    <var name="None"               value="0"/>
    <var name="SuperArmor"         value="1"  comment="霸体，不被打断"/>
    <var name="Invincible"         value="2"  comment="无敌，不受伤害"/>
    <var name="DodgeCancelImmune"  value="4"  comment="免疫闪避取消"/>
    <var name="SkillCancelImmune"  value="8"  comment="免疫技能取消"/>
    <var name="AirborneImmune"     value="16" comment="免疫浮空"/>
    <var name="GrabImmune"         value="32" comment="免疫抓取"/>
</enum>
```

### ECameraType - 镜头事件类型
```xml
<enum name="ECameraType">
    <var name="Shake"    value="0" comment="镜头震动"/>
    <var name="Zoom"     value="1" comment="镜头缩放"/>
    <var name="SlowMo"   value="2" comment="慢动作"/>
</enum>
```

---

## 二、表 (Table)

---

### 2.1 TbSkill - 技能主表

每个技能一行，仅包含基础属性。事件通过各事件表的 `skillId` 反向关联。

```xml
<bean name="Skill">
    <var name="id"            type="int"              comment="技能ID"/>
    <var name="name"          type="string"           comment="技能名称"/>
    <var name="category"      type="ESkillCategory"   comment="技能分类"/>
    <var name="costType"      type="ECostType"        comment="消耗类型"/>
    <var name="costValue"     type="int"              comment="消耗值"/>
    <var name="costType2"     type="ECostType"        comment="消耗类型2"/>
    <var name="costValue2"    type="int"              comment="消耗值2"/>
    <var name="cooldown"      type="float"            comment="冷却时间(秒)"/>
    <var name="tags"          type="ESkillTag"        comment="技能标签(复选)"/>
    <var name="remark"        type="string"           comment="备注"/>
    <var name="skillDuration" type="float"            comment="技能总时长(秒)"/>
</bean>

<table name="TbSkill" value="Skill" input="skill.csv"/>
```

#### CSV 示例 (skill.csv)

| id | name | category | costType | costValue | costType2 | costValue2 | cooldown | tags | remark | skillDuration |
|----|------|----------|----------|-----------|-----------|------------|----------|------|--------|---------------|
| 1001 | 三连斩·壹 | Normal | None | 0 | None | 0 | 0 | Melee | 普攻第一段 | 0.8 |

---

### 2.2 TbDeriveEvent - 派生事件表

描述一个派生窗口的时间参数和可派生的目标技能。同一技能可配置多个派生窗口，窗口之间允许时间重叠，运行时按 ID 顺序解析优先级。

```xml
<bean name="DeriveEvent">
    <var name="id"              type="int"      comment="派生事件ID"/>
    <var name="skillId"         type="int"      comment="所属技能ID"/>
    <var name="targetSkillIds"  type="list,int" comment="可派生到的技能ID列表"/>
    <var name="deriveStart"     type="float"    comment="派生起点(秒)"/>
    <var name="deriveEnd"       type="float"    comment="派生终点(秒)，可超过skillDuration"/>
    <var name="enablePreInput"  type="bool"     comment="是否开启预输入"/>
    <var name="preInputPoint"   type="float"    comment="预输入允许点(秒)，须在deriveStart之前，enablePreInput=false时忽略"/>
</bean>

<table name="TbDeriveEvent" value="DeriveEvent" input="derive_event.csv"/>
```

**约束：**
- `deriveStart` < `deriveEnd`
- `deriveEnd` 可以 > 所属技能的 `skillDuration`（允许超出技能时长）
- `preInputPoint` < `deriveStart`（若启用）
- 时间轴终点 = `max(skillDuration, 所有派生事件中最大的 deriveEnd)`

#### 时间轴示意
```
技能时间轴:  |============================|  skillDuration
派生窗口:              [===preInput===|===deriveStart==========deriveEnd===]
                       ^              ^                                    ^
                  preInputPoint   deriveStart                         deriveEnd
```

---

### 2.3 TbAnimEvent - 动画事件表 (点事件)

每个事件代表一个动画切换点。技能起始动画为 `triggerTime = 0` 的事件。

```xml
<bean name="AnimEvent">
    <var name="id"          type="int"    comment="事件ID"/>
    <var name="skillId"     type="int"    comment="所属技能ID"/>
    <var name="triggerTime" type="float"  comment="动画切换时间点(秒)"/>
    <var name="animName"    type="string" comment="动画名称"/>
</bean>

<table name="TbAnimEvent" value="AnimEvent" input="anim_event.csv"/>
```

**约束：**
- `triggerTime` 在 `[0, skillDuration]` 范围内
- 同一技能的多个 AnimEvent 的 `triggerTime` 不可重复
- `triggerTime = 0` 的事件为技能起始动画

#### 时间轴示意 (3 个动画切换点)
```
技能时间轴:  |============================|
动画事件:    ◆              ◆            ◆
           t=0           t=0.3        t=0.7
          anim_1         anim_2       anim_3
```

---

### 2.4 TbHitEvent - 伤害事件表 (点事件)

触发于单一时间点的伤害判定。

```xml
<bean name="HitEvent">
    <var name="id"           type="int"       comment="事件ID"/>
    <var name="skillId"      type="int"       comment="所属技能ID"/>
    <var name="triggerTime"  type="float"     comment="触发时间点(秒)"/>

    <!-- 攻击形状 -->
    <var name="shape"        type="EHitShape" comment="攻击形状"/>
    <var name="offsetX"      type="float"     comment="判定中心X偏移(角色本地坐标)"/>
    <var name="offsetY"      type="float"     comment="判定中心Y偏移(角色本地坐标)"/>
    <var name="rotation"     type="float"     comment="判定旋转角度(度)，0=角色朝向"/>
    <var name="shapeParam1"  type="float"     comment="形状参数1，见下方对照表"/>
    <var name="shapeParam2"  type="float"     comment="形状参数2"/>

    <!-- 战斗数值 -->
    <var name="damage"       type="int"       comment="伤害值"/>
    <var name="stagger"      type="float"     comment="僵直时间(秒)"/>
    <var name="knockback"    type="float"     comment="击退距离"/>
    <var name="poiseDamage"  type="float"     comment="削韧值"/>
    <var name="comboCount"   type="int"       comment="连击数(本次命中计入几连击)"/>
    <var name="hitStop"      type="float"     comment="顿帧时间(秒)，命中时双方冻结帧"/>
</bean>

<table name="TbHitEvent" value="HitEvent" input="hit_event.csv"/>
```

#### 形状参数对照表

offset 和 rotation 对所有形状通用，是判定区域整体的位置和朝向。
shapeParam1/2 按形状类型解释：

| EHitShape | shapeParam1 | shapeParam2 | 说明 |
|-----------|-------------|-------------|------|
| Circle    | radius      | -           | 圆心在 offset 处 |
| Rectangle | halfWidth   | halfHeight  | 中心在 offset 处，rotation 控制朝向 |
| Fan       | radius      | angle(度)   | 扇形圆心在 offset 处，朝 rotation 方向展开 |
| Ring      | innerRadius | outerRadius | 环心在 offset 处 |

#### 时间轴 / 俯视图示意
```
时间轴:
  |============================|
        ◆          ◆
   triggerTime  triggerTime

俯视图 (Fan, radius=3, angle=60):

          ·  *  *  ·
        ·  *  *  *  ·
      ·  *  *  *  *  ·
        · · ·[C]· · ·         C = 角色位置, * = 判定区域
```

---

### 2.5 TbBuffEvent - Buff 事件表 (点事件)

在指定时间点施加一个 Buff。Buff 的具体效果由外部 Buff 配置表定义，此处仅记录触发参数。

```xml
<bean name="BuffEvent">
    <var name="id"          type="int"         comment="事件ID"/>
    <var name="skillId"     type="int"         comment="所属技能ID"/>
    <var name="triggerTime" type="float"       comment="触发时间点(秒)"/>
    <var name="buffId"      type="int"         comment="Buff配置ID(引用外部Buff表)"/>
    <var name="target"      type="EBuffTarget" comment="施加目标"/>
    <var name="duration"    type="float"       comment="持续时间覆写(秒)，0=使用Buff表默认值"/>
    <var name="stackCount"  type="int"         comment="叠加层数，默认1"/>
</bean>

<table name="TbBuffEvent" value="BuffEvent" input="buff_event.csv"/>
```

**说明：**
- `buffId` 指向独立的 Buff 配置表（不在本编辑器范围内），本表只决定何时、对谁、施加多少层
- `duration = 0` 表示使用 Buff 自身配置的默认持续时间，非零值则覆写
- `target = Enemy` 时，施加给本次技能命中的目标（需配合 HitEvent 使用）

---

### 2.6 TbResourceEvent - 资源回复事件表 (点事件)

在指定时间点回复一种资源。

```xml
<bean name="ResourceEvent">
    <var name="id"           type="int"            comment="事件ID"/>
    <var name="skillId"      type="int"            comment="所属技能ID"/>
    <var name="triggerTime"  type="float"          comment="触发时间点(秒)"/>
    <var name="resourceType" type="EResourceType"  comment="回复的资源类型"/>
    <var name="value"        type="int"            comment="回复量(正数)"/>
    <var name="isPercent"    type="bool"           comment="true=百分比回复(基于最大值), false=固定值"/>
</bean>

<table name="TbResourceEvent" value="ResourceEvent" input="resource_event.csv"/>
```

**说明：**
- `isPercent = true` 且 `value = 10` 表示回复最大值的 10%
- 主要用途：普攻回能、技能吸血等

---

### 2.7 TbDisplacementEvent - 位移事件表 (持续事件)

在一段时间内驱动角色位移，常用于突进、后撤、冲刺等。

```xml
<bean name="DisplacementEvent">
    <var name="id"              type="int"               comment="事件ID"/>
    <var name="skillId"         type="int"               comment="所属技能ID"/>
    <var name="startTime"       type="float"             comment="开始时间(秒)"/>
    <var name="endTime"         type="float"             comment="结束时间(秒)"/>
    <var name="direction"       type="EDisplacementDir"  comment="位移方向"/>
    <var name="customAngle"     type="float"             comment="自定义角度(度)，仅direction=Custom时生效"/>
    <var name="distance"        type="float"             comment="总位移距离"/>
    <var name="curve"           type="EEaseCurve"        comment="速度曲线"/>
    <var name="ignoreCollision" type="bool"              comment="true=穿透碰撞体(闪现)，false=遇到碰撞停止"/>
</bean>

<table name="TbDisplacementEvent" value="DisplacementEvent" input="displacement_event.csv"/>
```

**约束：**
- `startTime` < `endTime`
- 运行时速度 = 将 `distance` 按 `curve` 分布在 `[startTime, endTime]` 区间
- `ignoreCollision = true` 典型场景：闪避无敌帧期间的位移

#### 时间轴示意
```
技能时间轴:  |============================|
位移事件:       [████████████]
             startTime     endTime
             direction=Forward, distance=5, curve=EaseOut
```

---

### 2.8 TbStateEvent - 状态事件表 (持续事件)

在一段时间内赋予角色特殊状态标记。

```xml
<bean name="StateEvent">
    <var name="id"         type="int"        comment="事件ID"/>
    <var name="skillId"    type="int"        comment="所属技能ID"/>
    <var name="startTime"  type="float"      comment="开始时间(秒)"/>
    <var name="endTime"    type="float"      comment="结束时间(秒)"/>
    <var name="stateFlags" type="EStateFlag" comment="状态标记(复选)"/>
</bean>

<table name="TbStateEvent" value="StateEvent" input="state_event.csv"/>
```

**约束：**
- `startTime` < `endTime`
- `stateFlags` 为 Flag 枚举，可组合（如 `SuperArmor|Invincible` = 霸体 + 无敌）
- 同一技能可配置多个 StateEvent，时间段可重叠（各自独立生效）

**典型用法：**
| 场景 | stateFlags | 时间段 |
|------|-----------|--------|
| 闪避无敌帧 | Invincible | 闪避动作起始 0.05s ~ 0.35s |
| 大招霸体 | SuperArmor \| DodgeCancelImmune \| SkillCancelImmune | 全程 |
| 抓取免疫 | GrabImmune \| AirborneImmune | 特定攻击段 |

---

### 2.9 TbVFXEvent - 特效事件表 (点事件)

在指定时间点生成一个视觉特效。

```xml
<bean name="VFXEvent">
    <var name="id"          type="int"    comment="事件ID"/>
    <var name="skillId"     type="int"    comment="所属技能ID"/>
    <var name="triggerTime" type="float"  comment="触发时间点(秒)"/>
    <var name="effectId"    type="string" comment="特效资源ID/路径"/>
    <var name="attachPoint" type="string" comment="挂点名称(空字符串=角色根节点)"/>
    <var name="offsetX"     type="float"  comment="X偏移(本地坐标)"/>
    <var name="offsetY"     type="float"  comment="Y偏移(本地坐标)"/>
    <var name="offsetZ"     type="float"  comment="Z偏移(本地坐标)"/>
    <var name="rotation"    type="float"  comment="Y轴旋转角度(度)"/>
    <var name="scale"       type="float"  comment="缩放倍率，1.0=原始大小"/>
    <var name="duration"    type="float"  comment="存活时间(秒)，0=跟随特效自身生命周期"/>
    <var name="followChar"  type="bool"   comment="true=跟随角色移动, false=生成后固定在世界坐标"/>
</bean>

<table name="TbVFXEvent" value="VFXEvent" input="vfx_event.csv"/>
```

---

### 2.10 TbSFXEvent - 音效事件表 (点事件)

在指定时间点播放一个音效。

```xml
<bean name="SFXEvent">
    <var name="id"          type="int"    comment="事件ID"/>
    <var name="skillId"     type="int"    comment="所属技能ID"/>
    <var name="triggerTime" type="float"  comment="触发时间点(秒)"/>
    <var name="audioId"     type="string" comment="音效资源ID/路径"/>
    <var name="volume"      type="float"  comment="音量倍率，1.0=默认"/>
    <var name="loop"        type="bool"   comment="是否循环播放"/>
    <var name="stopTime"    type="float"  comment="停止时间(秒)，0=播放完自然结束，loop=true时必填"/>
</bean>

<table name="TbSFXEvent" value="SFXEvent" input="sfx_event.csv"/>
```

---

### 2.11 TbCameraEvent - 镜头事件表 (持续事件)

在一段时间内执行镜头效果。

```xml
<bean name="CameraEvent">
    <var name="id"         type="int"          comment="事件ID"/>
    <var name="skillId"    type="int"          comment="所属技能ID"/>
    <var name="startTime"  type="float"        comment="开始时间(秒)"/>
    <var name="endTime"    type="float"        comment="结束时间(秒)"/>
    <var name="cameraType" type="ECameraType"  comment="镜头效果类型"/>
    <var name="intensity"  type="float"        comment="强度(震动幅度/缩放倍率/时间缩放)"/>
    <var name="curve"      type="EEaseCurve"   comment="强度变化曲线"/>
</bean>

<table name="TbCameraEvent" value="CameraEvent" input="camera_event.csv"/>
```

**参数按类型解释：**

| ECameraType | intensity 含义 | 典型值 |
|-------------|---------------|--------|
| Shake | 震动幅度(世界单位) | 0.1 ~ 0.5 |
| Zoom | 缩放倍率(1.0=默认) | 0.8(拉近) ~ 1.3(拉远) |
| SlowMo | Time.timeScale | 0.1(十倍慢放) ~ 0.5 |

---

### 2.12 TbLoopEvent - 循环事件表 (持续事件)

描述蓄力/循环技能的循环区间。时间轴播放到 `endTime` 时跳回 `startTime` 重复，松手或达到 `maxDuration` 后从 `endTime` 继续往后播放。

```xml
<bean name="LoopEvent">
    <var name="id"          type="int"   comment="事件ID"/>
    <var name="skillId"     type="int"   comment="所属技能ID"/>
    <var name="startTime"   type="float" comment="循环起点(秒)"/>
    <var name="endTime"     type="float" comment="循环终点(秒)"/>
    <var name="maxDuration" type="float" comment="最大循环总时长(秒)，0=无限直到松手"/>
</bean>

<table name="TbLoopEvent" value="LoopEvent" input="loop_event.csv"/>
```

**约束：**
- `startTime` < `endTime`
- 每个技能最多一个 LoopEvent
- 循环区间内的事件（Hit、VFX 等）每次循环都触发
- 蓄力等级通过派生系统实现：蓄到不同时长走不同派生分支

#### 时间轴示意
```
技能时间轴:  |============================|
循环事件:    [前摇][██ 循环段 ██][后摇/释放]
                  ↑            ↑
              startTime    endTime
                  ↑____repeat__↓  (持续按住时循环)
```

---

## 三、时间轴概念模型

时间轴不作为独立表导出，而是编辑器的可视化层。编辑器根据各事件表中的时间参数渲染时间轴。

```
时间轴轨道布局:

    轴起点(0) ──────────────────────────────────── 轴终点
    │                                               │
    │  轴终点 = max(skillDuration, 最大deriveEnd)
    │
    ├─ [派生轨道]   ░░░░[████████████████]░░░        派生窗口(段)
    │                 ◆                              preInput(可选点)
    │
    ├─ [动画轨道]   ◆         ◆           ◆          点事件(动画切换点)
    │             anim_1    anim_2     anim_3
    │
    ├─ [Hit轨道]        ◆            ◆               点事件(可拖拽)
    │
    ├─ [Buff轨道]            ◆                       点事件
    │
    ├─ [资源轨道]                         ◆           点事件
    │
    ├─ [VFX轨道]       ◆       ◆                     点事件
    │
    ├─ [SFX轨道]       ◆       ◆    ◆                点事件
    │
    ├─ [位移轨道]   [████████████]                    持续事件(两端可拖拽)
    │
    ├─ [状态轨道]      [██████████████████]           持续事件
    │
    ├─ [循环轨道]         [██████████]                持续事件(蓄力/循环区间)
    │
    └─ [镜头轨道]            [████████]               持续事件

    图例: ◆ = 可拖拽时间点    [████] = 可拖拽时间段(两端可调)
          ░░░ = 预输入允许区间（仅派生轨道）
```

### 轴终点规则
- 轴终点 = `max(skillDuration, max(所有deriveEvent.deriveEnd))`
- 无派生事件时轴终点 = `skillDuration`
- 编辑器中 `skillDuration` 和最大 `deriveEnd` 各显示为可调节的标记线

### 轨道分类

| 类型 | 轨道 | 可拖拽点 | 事件数量 |
|------|------|---------|---------|
| 特殊轨道 | 派生 | 起点/终点/预输入点 | 按 skillId 查 TbDeriveEvent |
| 点事件轨道 | 动画 / Hit / Buff / 资源 / VFX / SFX | triggerTime | 不限 |
| 持续事件轨道 | 位移 / 状态 / 循环 / 镜头 | startTime + endTime | 不限（循环最多1个）|

---

## 四、表关系总览

所有事件表通过 `skillId` 单向引用 TbSkill，Skill 表不持有任何事件引用。
运行时/编辑器加载后按 `skillId` 建反查索引。

```
TbSkill (技能主表)
  ▲
  │ skillId
  │
  ├── TbDeriveEvent ──── targetSkillIds[] ──► TbSkill.id (派生目标)
  ├── TbAnimEvent
  ├── TbHitEvent
  ├── TbBuffEvent
  ├── TbResourceEvent
  ├── TbVFXEvent
  ├── TbSFXEvent
  ├── TbCameraEvent
  ├── TbDisplacementEvent
  ├── TbStateEvent
  └── TbLoopEvent
```

---

## 五、ID 分配规则

- 每张表的 ID **在表内自增**，由编辑器自动分配
- 不同表的 ID 相互独立（HitEvent.id=1 和 BuffEvent.id=1 可以共存）
- 跨表引用通过 `skillId` 关联，不需要额外的组合键

---

## 六、完整实例：三连斩

以一个三段普攻为例，展示各表之间的配合关系。

### 技能设计
- 三连斩：轻攻击三段，每段可派生到下一段，第三段结束后回到第一段
- 第一段有前冲位移，第二段带 AoE，第三段带击飞 + 镜头震动

### TbSkill

| id | name | category | costType | costValue | costType2 | costValue2 | cooldown | tags | remark | skillDuration |
|----|------|----------|----------|-----------|-----------|------------|----------|------|--------|---------------|
| 1001 | 三连斩·壹 | Normal | None | 0 | None | 0 | 0 | Melee | 普攻第一段 | 0.8 |
| 1002 | 三连斩·贰 | Normal | None | 0 | None | 0 | 0 | Melee\|AoE | 普攻第二段 | 0.9 |
| 1003 | 三连斩·叁 | Normal | None | 0 | None | 0 | 0 | Melee\|AoE | 普攻第三段 | 1.2 |

### TbDeriveEvent

| id | skillId | targetSkillIds | deriveStart | deriveEnd | enablePreInput | preInputPoint |
|----|---------|----------------|-------------|-----------|----------------|---------------|
| 1 | 1001 | 1002 | 0.4 | 1.0 | true | 0.3 |
| 2 | 1002 | 1003 | 0.5 | 1.1 | true | 0.35 |
| 3 | 1003 | 1001 | 0.7 | 1.4 | false | 0 |

### TbAnimEvent

| id | skillId | triggerTime | animName |
|----|---------|-------------|----------|
| 1 | 1001 | 0 | slash_1 |
| 2 | 1002 | 0 | slash_2 |
| 3 | 1003 | 0 | slash_3 |

> 三连斩每段只有一个动画，均在 t=0 切换

### TbHitEvent

| id | skillId | triggerTime | shape | offsetX | offsetY | rotation | shapeParam1 | shapeParam2 | damage | stagger | knockback | poiseDamage | comboCount | hitStop |
|----|---------|-------------|-------|---------|---------|----------|-------------|-------------|--------|---------|-----------|-------------|------------|---------|
| 1 | 1001 | 0.25 | Fan | 0 | 1.0 | 0 | 2.5 | 90 | 100 | 0.3 | 0.5 | 10 | 1 | 0.05 |
| 2 | 1002 | 0.35 | Circle | 0 | 0 | 0 | 3.0 | 0 | 120 | 0.3 | 0.8 | 15 | 1 | 0.05 |
| 3 | 1003 | 0.5 | Fan | 0 | 1.5 | 0 | 3.5 | 120 | 200 | 0.8 | 3.0 | 30 | 1 | 0.1 |

### TbDisplacementEvent

| id | skillId | startTime | endTime | direction | customAngle | distance | curve | ignoreCollision |
|----|---------|-----------|---------|-----------|-------------|----------|-------|-----------------|
| 1 | 1001 | 0.1 | 0.3 | Forward | 0 | 2.0 | EaseOut | false |
| 2 | 1003 | 0.3 | 0.55 | Forward | 0 | 3.0 | EaseIn | false |

### TbStateEvent

| id | skillId | startTime | endTime | stateFlags |
|----|---------|-----------|---------|------------|
| 1 | 1003 | 0.2 | 0.6 | SuperArmor |

### TbCameraEvent

| id | skillId | startTime | endTime | cameraType | intensity | curve |
|----|---------|-----------|---------|------------|-----------|-------|
| 1 | 1003 | 0.5 | 0.65 | Shake | 0.3 | EaseOut |

### TbVFXEvent

| id | skillId | triggerTime | effectId | attachPoint | offsetX | offsetY | offsetZ | rotation | scale | duration | followChar |
|----|---------|-------------|----------|-------------|---------|---------|---------|----------|-------|----------|------------|
| 1 | 1001 | 0.2 | vfx_slash_01 | weapon_tip | 0 | 0 | 0 | 0 | 1.0 | 0 | true |
| 2 | 1002 | 0.3 | vfx_slash_circle | | 0 | 0 | 0 | 0 | 1.2 | 0 | false |
| 3 | 1003 | 0.45 | vfx_slash_heavy | weapon_tip | 0 | 0 | 0 | 0 | 1.5 | 0 | true |

### TbSFXEvent

| id | skillId | triggerTime | audioId | volume | loop | stopTime |
|----|---------|-------------|---------|--------|------|----------|
| 1 | 1001 | 0.2 | sfx_slash_light | 1.0 | false | 0 |
| 2 | 1002 | 0.3 | sfx_slash_whoosh | 1.0 | false | 0 |
| 3 | 1003 | 0.45 | sfx_slash_heavy | 1.2 | false | 0 |

### TbResourceEvent

| id | skillId | triggerTime | resourceType | value | isPercent |
|----|---------|-------------|--------------|-------|-----------|
| 1 | 1003 | 0.5 | Energy | 15 | false |

> 第三段命中回复 15 点能量

### 时间轴可视化 (三连斩·叁, id=1003)

```
0.0       0.2       0.4       0.6       0.8       1.0       1.2       1.4
 |---------|---------|---------|---------|---------|---------|---------|
 [======================== skillDuration ========================]
                                  [===== deriveStart =============== deriveEnd =]
                                  0.7                                       1.4

 [动画]  ◆ 0.0 slash_3

 [Hit]                    ◆ 0.5 (Fan r=3.5 a=120°)

 [位移]        [██████████] 0.3~0.55 Forward d=3.0

 [状态]     [█████████████] 0.2~0.6 SuperArmor

 [镜头]                   [███] 0.5~0.65 Shake 0.3

 [VFX]                 ◆ 0.45 vfx_slash_heavy

 [SFX]                 ◆ 0.45 sfx_slash_heavy

 [资源]                   ◆ 0.5 Energy +15
```
