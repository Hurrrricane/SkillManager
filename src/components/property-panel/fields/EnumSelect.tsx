import styles from './Fields.module.css'

interface EnumSelectProps<T extends number> {
  label: string
  value: T
  options: { label: string; value: T }[]
  onChange: (v: T) => void
  disabled?: boolean
}

export function EnumSelect<T extends number>({
  label, value, options, onChange, disabled,
}: EnumSelectProps<T>) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <select
        className={styles.select}
        value={value}
        onChange={e => onChange(Number(e.target.value) as T)}
        disabled={disabled}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
