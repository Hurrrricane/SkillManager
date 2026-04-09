/** 检查 flags 值中是否包含指定 flag */
export function hasFlag(value: number, flag: number): boolean {
  if (flag === 0) return value === 0
  return (value & flag) === flag
}

/** 设置/清除某个 flag */
export function setFlag(value: number, flag: number, on: boolean): number {
  return on ? value | flag : value & ~flag
}

/** 将 flags 数值序列化为 "A|B|C" 字符串（用于 CSV 导出）*/
export function serializeFlags(
  value: number,
  enumObj: Record<string, number | string>,
): string {
  if (value === 0) return 'None'
  const names: string[] = []
  for (const [key, v] of Object.entries(enumObj)) {
    if (typeof v === 'number' && v !== 0 && (value & v) === v) {
      names.push(key)
    }
  }
  return names.length > 0 ? names.join('|') : 'None'
}
