import { hasFlag, setFlag } from '@/utils/flagsUtils'
import styles from './Fields.module.css'

interface FlagsCheckboxProps {
  label: string
  value: number
  options: { label: string; flag: number }[]
  onChange: (v: number) => void
}

export function FlagsCheckbox({ label, value, options, onChange }: FlagsCheckboxProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={styles.checkboxGroup}>
        {options.map(o => (
          <label key={o.flag} className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={hasFlag(value, o.flag)}
              onChange={e => onChange(setFlag(value, o.flag, e.target.checked))}
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  )
}
