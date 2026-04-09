import { useState } from 'react'
import styles from './Fields.module.css'

interface NumberInputProps {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

export function NumberInput({ label, value, onChange, min, max, step = 0.01, disabled }: NumberInputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input
        className={styles.input}
        type="number"
        value={focused ? value : parseFloat(value.toFixed(2))}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={e => {
          const v = parseFloat(e.target.value)
          if (!isNaN(v)) onChange(parseFloat(v.toFixed(2)))
        }}
      />
    </div>
  )
}
