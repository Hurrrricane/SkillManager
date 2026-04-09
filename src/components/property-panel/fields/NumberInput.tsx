import { useState, useRef } from 'react'
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

function clamp(v: number, min?: number, max?: number) {
  if (min !== undefined && v < min) v = min
  if (max !== undefined && v > max) v = max
  return v
}

function fmt(v: number) {
  return parseFloat(v.toFixed(2)).toString()
}

export function NumberInput({ label, value, onChange, min, max, step = 0.01, disabled }: NumberInputProps) {
  // localText: non-null when the input is focused (holds raw editing string)
  const [localText, setLocalText] = useState<string | null>(null)
  const dragRef  = useRef<{ startX: number; startVal: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const commit = (raw: string) => {
    const v = parseFloat(raw)
    if (!isNaN(v)) onChange(clamp(parseFloat(v.toFixed(2)), min, max))
  }

  // ── Label drag (Unity-style) ────────────────────────────────────
  const handleLabelMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    // Blur the input so localText is cleared and live value updates are visible
    inputRef.current?.blur()
    dragRef.current = { startX: e.clientX, startVal: value }

    const saved = { sel: document.body.style.userSelect, cur: document.body.style.cursor }
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'ew-resize'

    const onMove = (me: MouseEvent) => {
      if (!dragRef.current) return
      const dx = me.clientX - dragRef.current.startX
      const raw = dragRef.current.startVal + dx * step
      onChange(clamp(parseFloat(raw.toFixed(2)), min, max))
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.userSelect = saved.sel
      document.body.style.cursor = saved.cur
      dragRef.current = null
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // ── Input handlers ──────────────────────────────────────────────
  const handleFocus = () => setLocalText(fmt(value))

  const handleBlur = () => {
    if (localText !== null) commit(localText)
    setLocalText(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setLocalText(raw)
    commit(raw)   // live update when value is valid; no-op when empty/partial
  }

  const displayValue = localText !== null ? localText : fmt(value)

  return (
    <div className={styles.field}>
      <label
        className={`${styles.label} ${disabled ? '' : styles.labelDrag}`}
        onMouseDown={handleLabelMouseDown}
      >
        {label}
      </label>
      <input
        ref={inputRef}
        className={styles.input}
        type="text"
        inputMode="decimal"
        value={displayValue}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
      />
    </div>
  )
}
