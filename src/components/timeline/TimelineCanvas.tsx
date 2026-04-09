import { useEffect, useRef, useCallback } from 'react'
import { useSkillStore, useEventStore, useUIStore } from '@/store'
import { useTimelineEnd } from '@/hooks/useSkillDuration'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import { useTimelineRenderer, getTotalHeight, CANVAS_PADDING_RIGHT } from './useTimelineRenderer'
import { useTimelineInteraction } from './useTimelineInteraction'
import { TRACK_LABEL_WIDTH, TRACKS, getTrackY, RULER_HEIGHT, DURATION_TRACK_HEIGHT } from './tracks'
import styles from './TimelineCanvas.module.css'

export function TimelineCanvas() {
  const { selectedSkillId, skills } = useSkillStore()
  const events = useEventStore(s => selectedSkillId ? (s.index[selectedSkillId] ?? []) : [])
  const { timelineZoom: zoom, timelineScrollX: scrollX, selectedEvent, cursorX, setZoom, setScrollX } = useUIStore()

  const skill = skills.find(s => s.id === selectedSkillId)
  const skillDuration = skill?.skillDuration ?? 0
  const totalDuration = useTimelineEnd(selectedSkillId ?? -1, skillDuration)

  const [containerRef, containerSize] = useResizeObserver<HTMLDivElement>()
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const dirty = useRef(true)
  const rafId = useRef<number>(0)
  const hoveredRef = useRef<{ id: number | null; kind: string | null }>({ id: null, kind: null })

  const render = useTimelineRenderer()
  const redraw = useCallback(() => { dirty.current = true }, [])
  const onHoverChange = useCallback((id: number | null, kind: string | null) => {
    hoveredRef.current = { id, kind }
    dirty.current = true
  }, [])

  const interaction = useTimelineInteraction({
    events, zoom, scrollX, skillDuration,
    canvasRef, onRedraw: redraw, onHoverChange,
  })

  // RAF 绘制循环
  useEffect(() => {
    const loop = () => {
      if (dirty.current && canvasRef.current) {
        dirty.current = false
        render({
          canvas: canvasRef.current,
          events, zoom, scrollX, totalDuration, skillDuration,
          selectedEventId: selectedEvent?.id ?? null,
          selectedEventKind: selectedEvent?.kind ?? null,
          hoveredEventId: hoveredRef.current.id,
          hoveredEventKind: hoveredRef.current.kind,
          cursorX,
        })
      }
      rafId.current = requestAnimationFrame(loop)
    }
    rafId.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId.current)
  }, [render, events, zoom, scrollX, totalDuration, skillDuration, selectedEvent, cursorX])

  // 容器大小 → canvas 尺寸
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !containerSize.width) return
    const dpr = window.devicePixelRatio || 1
    const h = getTotalHeight()
    canvas.width  = containerSize.width * dpr
    canvas.height = h * dpr
    canvas.style.width  = `${containerSize.width}px`
    canvas.style.height = `${h}px`
    dirty.current = true
  }, [containerSize])

  useEffect(() => { dirty.current = true }, [events, zoom, scrollX, totalDuration, skillDuration, selectedEvent, cursorX])

  // 缩放滚轮（悬停于缩放指示器时）
  const onZoomWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
    const newZoom = zoom * factor
    // 以 canvas 中央为缩放中心
    const cx = containerSize.width / 2
    const tAtCenter = (cx + scrollX) / zoom
    const newScrollX = Math.max(0, tAtCenter * newZoom - cx)
    setZoom(newZoom)
    setScrollX(newScrollX)
  }, [zoom, scrollX, containerSize.width, setZoom, setScrollX])

  const totalCanvasW = totalDuration * zoom + CANVAS_PADDING_RIGHT

  if (!selectedSkillId) {
    return (
      <div className={styles.empty}>
        <span>← 从左侧选择一个技能</span>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      {/* 工具栏 */}
      <div className={styles.toolbar}>
        <span className={styles.skillName}>{skill?.name}</span>
        <div
          className={styles.zoomControl}
          onWheel={onZoomWheel}
          title="滚轮调整缩放"
        >
          <span className={styles.zoomLabel}>缩放</span>
          <span className={styles.zoomVal}>{zoom.toFixed(0)} px/s</span>
          <span className={styles.zoomHint}>↕ 滚轮</span>
        </div>
      </div>

      {/* 时间轴主体 */}
      <div className={styles.body}>
        {/* 左侧轨道标题 */}
        <div className={styles.labels} style={{ width: TRACK_LABEL_WIDTH }}>
          <div style={{ height: RULER_HEIGHT }} />
          {/* 技能时长轨道标题 */}
          <div
            className={styles.trackLabel}
            style={{ height: DURATION_TRACK_HEIGHT, borderLeft: '3px solid #f5c2e7', fontSize: 10 }}
          >
            时长
          </div>
          {TRACKS.map(t => (
            <div
              key={t.id}
              className={styles.trackLabel}
              style={{ height: t.height, borderLeft: `3px solid ${t.color}` }}
            >
              {t.label}
            </div>
          ))}
        </div>

        {/* Canvas 滚动区 */}
        <div ref={containerRef} className={styles.canvasArea}>
          <div style={{ width: totalCanvasW, position: 'relative' }}>
            <canvas
              ref={canvasRef}
              {...interaction}
              style={{ display: 'block' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
