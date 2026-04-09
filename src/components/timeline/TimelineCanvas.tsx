import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useSkillStore, useEventStore, useUIStore } from '@/store'
import { DeriveEvent } from '@/types'
import { useTimelineEnd } from '@/hooks/useSkillDuration'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import { useTimelineRenderer, getTotalHeight, CANVAS_PADDING_RIGHT } from './useTimelineRenderer'
import { useTimelineInteraction } from './useTimelineInteraction'
import {
  TRACK_LABEL_WIDTH, TRACKS, RULER_HEIGHT, DURATION_TRACK_HEIGHT,
  calcDeriveRows, getDeriveTrackHeight, getTotalHeightDyn,
} from './tracks'
import styles from './TimelineCanvas.module.css'

export function TimelineCanvas() {
  const { selectedSkillId, skills } = useSkillStore()
  const events = useEventStore(s => selectedSkillId ? (s.index[selectedSkillId] ?? []) : [])
  const { timelineZoom: zoom, timelineScrollX: scrollX, selectedEvent, selectedTrack, cursorX, setZoom, setScrollX, setSelectedTrack } = useUIStore()

  const skill = skills.find(s => s.id === selectedSkillId)
  const skillDuration = skill?.skillDuration ?? 0
  const totalDuration = useTimelineEnd(selectedSkillId ?? -1, skillDuration)

  // 派生行分配（每当 derive 事件变化时重算）
  const { deriveRows, deriveRowCount } = useMemo(() => {
    const derives = events.filter(e => e.kind === 'DeriveEvent') as DeriveEvent[]
    const rows = calcDeriveRows(derives)
    const count = derives.length === 0 ? 1 : Math.max(1, ...Array.from(rows.values()).map(v => v + 1))
    return { deriveRows: rows, deriveRowCount: count }
  }, [events])

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
    deriveRows, deriveRowCount,
    canvasRef, onRedraw: redraw, onHoverChange,
  })

  // RAF 绘制
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
          deriveRows,
          deriveRowCount,
          selectedTrack,
        })
      }
      rafId.current = requestAnimationFrame(loop)
    }
    rafId.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId.current)
  }, [render, events, zoom, scrollX, totalDuration, skillDuration, selectedEvent, selectedTrack, cursorX, deriveRows, deriveRowCount])

  // canvas 尺寸
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !containerSize.width) return
    const dpr = window.devicePixelRatio || 1
    const h = getTotalHeightDyn(deriveRowCount)
    canvas.width  = containerSize.width * dpr
    canvas.height = h * dpr
    canvas.style.width  = `${containerSize.width}px`
    canvas.style.height = `${h}px`
    dirty.current = true
  }, [containerSize, deriveRowCount])

  useEffect(() => { dirty.current = true }, [events, zoom, scrollX, totalDuration, skillDuration, selectedEvent, selectedTrack, cursorX, deriveRows, deriveRowCount])

  // 缩放（等比保留 scrollX 比例，t=0 随 zoom 等比缩放始终可见）
  const onZoomWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
    const newZoom = Math.max(50, Math.min(2000, zoom * factor))
    const newScrollX = Math.max(0, scrollX * newZoom / zoom)
    setZoom(newZoom)
    setScrollX(newScrollX)
  }, [zoom, scrollX, setZoom, setScrollX])

  const totalCanvasW = totalDuration * zoom + CANVAS_PADDING_RIGHT

  if (!selectedSkillId) {
    return (
      <div className={styles.empty}>
        <span>← 从左侧选择一个技能</span>
      </div>
    )
  }

  const deriveTrackH = getDeriveTrackHeight(deriveRowCount)

  return (
    <div className={styles.wrapper}>
      {/* 工具栏 */}
      <div className={styles.toolbar}>
        <span className={styles.skillName}>{skill?.name}</span>
        <div className={styles.zoomControl} onWheel={onZoomWheel} title="滚轮调整缩放">
          <span className={styles.zoomLabel}>缩放</span>
          <span className={styles.zoomVal}>{zoom.toFixed(0)} px/s</span>
          <span className={styles.zoomHint}>↕ 滚轮</span>
        </div>
      </div>

      <div className={styles.body}>
        {/* 左侧轨道标题 */}
        <div className={styles.labels} style={{ width: TRACK_LABEL_WIDTH }}>
          <div style={{ height: RULER_HEIGHT }} />
          {/* 时长轨道 */}
          <div
            className={styles.trackLabel}
            style={{ height: DURATION_TRACK_HEIGHT, borderLeft: '3px solid #f5c2e7', fontSize: 10 }}
          >
            时长
          </div>
          {TRACKS.map(t => {
            const h = t.kind === 'DeriveEvent' ? deriveTrackH : t.height
            const isTrackSelected = selectedTrack === t.kind
            const isEventActive = !isTrackSelected && selectedEvent?.kind === t.kind
            const labelCls = [
              styles.trackLabel,
              styles.trackLabelClickable,
              isTrackSelected ? styles.trackLabelSelected : '',
              isEventActive  ? styles.trackLabelEventActive : '',
            ].filter(Boolean).join(' ')
            return (
              <div
                key={t.id}
                className={labelCls}
                style={{ height: h, borderLeft: `3px solid ${t.color}` }}
                onClick={() => setSelectedTrack(t.kind)}
                title={`点击查看 ${t.label} 轨道详情`}
              >
                <span>{t.label}</span>
                <span className={styles.trackCount}>
                  {events.filter(e => e.kind === t.kind).length}
                </span>
              </div>
            )
          })}
        </div>

        {/* Canvas 滚动区 */}
        <div ref={containerRef} className={styles.canvasArea}>
          <div style={{ width: totalCanvasW, position: 'relative' }}>
            <canvas ref={canvasRef} {...interaction} style={{ display: 'block' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
