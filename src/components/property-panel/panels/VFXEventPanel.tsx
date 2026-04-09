import styles from './Panel.module.css'
export function VFXEventPanel({ event }: { event: Record<string, unknown> }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>VFX 事件</div>
      <pre className={styles.raw}>{JSON.stringify(event, null, 2)}</pre>
    </div>
  )
}
