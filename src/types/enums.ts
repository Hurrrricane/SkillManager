// ── 普通枚举（顺序递增）────────────────────────────────────────

export enum ESkillCategory {
  Normal   = 0,
  Skill    = 1,
  Ultimate = 2,
  Dodge    = 3,
}

export enum ECostType {
  None   = 0,
  MP     = 1,
  Energy = 2,
  HP     = 3,
}

export enum EHitShape {
  Circle    = 0,
  Rectangle = 1,
  Fan       = 2,
  Ring      = 3,
}

export enum EBuffTarget {
  Self  = 0,
  Enemy = 1,
}

export enum EResourceType {
  HP     = 1,
  MP     = 2,
  Energy = 3,
}

export enum EDisplacementDir {
  Forward        = 0,
  Backward       = 1,
  Left           = 2,
  Right          = 3,
  ToTarget       = 4,
  AwayFromTarget = 5,
  Custom         = 6,
}

export enum EEaseCurve {
  Linear    = 0,
  EaseIn    = 1,
  EaseOut   = 2,
  EaseInOut = 3,
}

export enum ECameraType {
  Shake  = 0,
  Zoom   = 1,
  SlowMo = 2,
}

// ── Flag 枚举（2 的幂次）──────────────────────────────────────

export enum ESkillTag {
  None       = 0,
  Melee      = 1 << 0,  // 1
  Ranged     = 1 << 1,  // 2
  AoE        = 1 << 2,  // 4
  Projectile = 1 << 3,  // 8
  SuperArmor = 1 << 4,  // 16
  Invincible = 1 << 5,  // 32
}

export enum EStateFlag {
  None               = 0,
  SuperArmor         = 1 << 0,  // 1
  Invincible         = 1 << 1,  // 2
  DodgeCancelImmune  = 1 << 2,  // 4
  SkillCancelImmune  = 1 << 3,  // 8
  AirborneImmune     = 1 << 4,  // 16
  GrabImmune         = 1 << 5,  // 32
}
