import styles from './Panel.module.css'
export function LoopEventPanel({ event }: { event: Record<string, unknown> }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>Loop 事件</div>
      <pre className={styles.raw}>{JSON.stringify(event, null, 2)}</pre>
    </div>
  )
}
