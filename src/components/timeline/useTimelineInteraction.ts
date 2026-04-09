import { useCallback, useRef } from 'react'
import { AnyEvent, DeriveEvent, isDeriveEvent, isPointEvent } from '@/types'
import { useEventStore, useSkillStore, useUIStore } from '@/store'
import { hitTest, isEventHit, isSkillDurationHit, cursorForHit } from './hitTest'
import { MIN_DURATION, RULER_HEIGHT, DURATION_TRACK_HEIGHT, SNAP_UNIT } from './tracks'

function snap(t: number): number {
  return Math.round(t / SNAP_UNIT) * SNAP_UNIT
}

type DragState =
  | { type: 'none' }
  | { type: 'point';         event: AnyEvent;    startClientX: number; originalTime: number;  moved: boolean }
  | { type: 'preInput';      event: DeriveEvent; startClientX: number; originalPre: number;   moved: boolean }
  | { type: 'duration';      event: AnyEvent;    zone: 'left'|'right'|'body'; startClientX: number; originalStart: number; originalEnd: number; moved: boolean }
  | { type: 'skillDuration'; startClientX: number; originalDur: number; moved: boolean }

interface InteractionOptions {
  events: AnyEvent[]
  zoom: number
  scrollX: number
  skillDuration: number
  deriveRows: Map<number, number>
  deriveRowCount: number
  canvasRef: React.RefObject<HTMLCanvasElement>
  onRedraw: () => void
  onHoverChange: (id: number | null, kind: string | null) => void
}

export function useTimelineInteraction(opts: InteractionOptions) {
  const drag = useRef<DragState>({ type: 'none' })

  const getCanvasXY = useCallback((clientX: number, clientY: number) => {
    const rect = opts.canvasRef.current?.getBoundingClientRect()
    return rect
      ? { cx: clientX - rect.left, cy: clientY - rect.top }
      : { cx: 0, cy: 0 }
  }, [opts.canvasRef])

  const doHitTest = useCallback((cx: number, cy: number) =>
    hitTest(cx, cy, opts.events, opts.zoom, opts.scrollX, opts.skillDuration, opts.deriveRows, opts.deriveRowCount),
    [opts])

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return
    const { cx, cy } = getCanvasXY(e.clientX, e.clientY)
    if (cy < RULER_HEIGHT) return

    const hit = doHitTest(cx, cy)
    if (!hit) { useUIStore.getState().selectEvent(null); return }

    if (isSkillDurationHit(hit)) {
      drag.current = { type: 'skillDuration', startClientX: e.clientX, originalDur: opts.skillDuration, moved: false }
      e.preventDefault(); return
    }

    const { event, zone } = hit as import('./hitTest').HitResult
    useUIStore.getState().selectEvent({ id: event.id, kind: event.kind, skillId: event.skillId })

    if (zone === 'preInput' && isDeriveEvent(event)) {
      drag.current = { type: 'preInput', event, startClientX: e.clientX, originalPre: event.preInputPoint, moved: false }
    } else if (isPointEvent(event)) {
      drag.current = { type: 'point', event, startClientX: e.clientX, originalTime: event.triggerTime, moved: false }
    } else if (isDeriveEvent(event)) {
      drag.current = { type: 'duration', event, zone: zone as 'left'|'right'|'body', startClientX: e.clientX, originalStart: event.deriveStart, originalEnd: event.deriveEnd, moved: false }
    } else {
      const ev = event as { startTime: number; endTime: number }
      drag.current = { type: 'duration', event, zone: zone as 'left'|'right'|'body', startClientX: e.clientX, originalStart: ev.startTime, originalEnd: ev.endTime, moved: false }
    }
    e.preventDefault()
  }, [opts, doHitTest, getCanvasXY])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = opts.canvasRef.current
    if (!canvas) return
    const { cx, cy } = getCanvasXY(e.clientX, e.clientY)
    const d = drag.current

    useUIStore.getState().setCursorX(cx)

    if (d.type === 'none') {
      const isRuler = cy < RULER_HEIGHT
      const hit = doHitTest(cx, cy)
      canvas.style.cursor = cursorForHit(hit, isRuler)
      opts.onHoverChange(
        hit && isEventHit(hit) ? hit.event.id : null,
        hit && isEventHit(hit) ? hit.event.kind : null,
      )
      return
    }

    const deltaX = e.clientX - d.startClientX
    if (!d.moved && Math.abs(deltaX) > 3) {
      // @ts-expect-error mutating ref
      drag.current.moved = true
    }
    if (!drag.current.moved) return

    canvas.style.cursor = 'grabbing'
    const deltaSec = deltaX / opts.zoom
    const { updateEvent } = useEventStore.getState()

    if (d.type === 'skillDuration') {
      const newDur = Math.max(0.01, snap(d.originalDur + deltaSec))
      const { selectedSkillId, updateSkill } = useSkillStore.getState()
      if (selectedSkillId) updateSkill(selectedSkillId, { skillDuration: newDur })

    } else if (d.type === 'point') {
      const newTime = Math.max(0, snap(d.originalTime + deltaSec))
      updateEvent(d.event.skillId, d.event.id, d.event.kind, { triggerTime: newTime } as Partial<AnyEvent>)

    } else if (d.type === 'preInput') {
      const maxPre = (d.event as DeriveEvent).deriveStart - SNAP_UNIT
      const newPre = Math.max(0, Math.min(maxPre, snap(d.originalPre + deltaSec)))
      updateEvent(d.event.skillId, d.event.id, 'DeriveEvent', { preInputPoint: newPre } as Partial<AnyEvent>)

    } else if (d.type === 'duration') {
      if (d.zone === 'body') {
        const dur = d.originalEnd - d.originalStart
        const newStart = Math.max(0, snap(d.originalStart + deltaSec))
        const newEnd = snap(newStart + dur)
        if (isDeriveEvent(d.event)) {
          updateEvent(d.event.skillId, d.event.id, d.event.kind, { deriveStart: newStart, deriveEnd: newEnd } as Partial<AnyEvent>)
        } else {
          updateEvent(d.event.skillId, d.event.id, d.event.kind, { startTime: newStart, endTime: newEnd } as Partial<AnyEvent>)
        }
      } else if (d.zone === 'left') {
        const newStart = Math.max(0, Math.min(d.originalEnd - MIN_DURATION, snap(d.originalStart + deltaSec)))
        if (isDeriveEvent(d.event)) {
          updateEvent(d.event.skillId, d.event.id, d.event.kind, { deriveStart: newStart } as Partial<AnyEvent>)
        } else {
          updateEvent(d.event.skillId, d.event.id, d.event.kind, { startTime: newStart } as Partial<AnyEvent>)
        }
      } else {
        const newEnd = Math.max(d.originalStart + MIN_DURATION, snap(d.originalEnd + deltaSec))
        if (isDeriveEvent(d.event)) {
          updateEvent(d.event.skillId, d.event.id, d.event.kind, { deriveEnd: newEnd } as Partial<AnyEvent>)
        } else {
          updateEvent(d.event.skillId, d.event.id, d.event.kind, { endTime: newEnd } as Partial<AnyEvent>)
        }
      }
    }
    opts.onRedraw()
  }, [opts, doHitTest, getCanvasXY])

  const onMouseUp = useCallback(() => { drag.current = { type: 'none' } }, [])

  const onMouseLeave = useCallback(() => {
    if (drag.current.type === 'none') {
      opts.onHoverChange(null, null)
      useUIStore.getState().setCursorX(null)
    }
    const canvas = opts.canvasRef.current
    if (canvas) canvas.style.cursor = 'default'
  }, [opts])

  const onWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const { setScrollX, timelineScrollX } = useUIStore.getState()
    setScrollX(timelineScrollX + e.deltaY * 0.8)
  }, [])

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onWheel }
}
