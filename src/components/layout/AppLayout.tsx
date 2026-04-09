import { useCallback, useRef } from 'react'
import { SkillList } from '@/components/skill-list/SkillList'
import { TimelineCanvas } from '@/components/timeline/TimelineCanvas'
import { PropertyPanel } from '@/components/property-panel/PropertyPanel'
import { useUIStore } from '@/store'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const { panelWidth, setPanelWidth } = useUIStore()
  const resizing = useRef(false)
  const startX = useRef(0)
  const startW = useRef(0)

  const onDividerDown = useCallback((e: React.MouseEvent) => {
    resizing.current = true
    startX.current = e.clientX
    startW.current = panelWidth
    e.preventDefault()

    const onMove = (ev: MouseEvent) => {
      if (!resizing.current) return
      // 向左拖 → 面板变宽
      const delta = startX.current - ev.clientX
      setPanelWidth(startW.current + delta)
    }
    const onUp = () => {
      resizing.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [panelWidth, setPanelWidth])

  return (
    <div className={styles.layout}>
      <SkillList />
      <TimelineCanvas />
      {/* 拖拽分隔条 */}
      <div className={styles.divider} onMouseDown={onDividerDown} />
      <div className={styles.panelWrapper} style={{ width: panelWidth }}>
        <PropertyPanel />
      </div>
    </div>
  )
}
