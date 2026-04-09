import styles from './Panel.module.css'
export function CameraEventPanel({ event }: { event: Record<string, unknown> }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>Camera 事件</div>
      <pre className={styles.raw}>{JSON.stringify(event, null, 2)}</pre>
    </div>
  )
}
