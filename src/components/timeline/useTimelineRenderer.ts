import { useCallback } from 'react'
import { AnyEvent, isDeriveEvent, isPointEvent } from '@/types'
import {
  TRACKS, RULER_HEIGHT, DURATION_TRACK_HEIGHT,
  POINT_EVENT_RADIUS, CANVAS_PADDING_RIGHT,
  getTrackY, getTotalHeight,
} from './tracks'

function calcTickStep(zoom: number): { major: number; minor: number } {
  const candidates = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10]
  const minPxPerMajor = 60
  const step = candidates.find(s => s * zoom >= minPxPerMajor) ?? 10
  return { major: step, minor: step / 5 }
}

export interface RenderParams {
  canvas: HTMLCanvasElement
  events: AnyEvent[]
  zoom: number
  scrollX: number
  totalDuration: number
  skillDuration: number
  selectedEventId: number | null
  selectedEventKind: string | null
  hoveredEventId: number | null
  hoveredEventKind: string | null
  cursorX: number | null
}

export function useTimelineRenderer() {
  const render = useCallback((p: RenderParams) => {
    const { canvas, events, zoom, scrollX, totalDuration, skillDuration } = p
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W = canvas.width / dpr
    const H = canvas.height / dpr

    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const timeToX = (t: number) => t * zoom - scrollX

    // ── 技能总长度轨道（duration track）────────────────────────
    const dty = RULER_HEIGHT
    const dth = DURATION_TRACK_HEIGHT
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, dty, W, dth)

    // totalDuration 区域（浅色底）
    const tdX = timeToX(totalDuration)
    if (tdX > 0) {
      ctx.fillStyle = 'rgba(100,100,140,0.15)'
      ctx.fillRect(0, dty, Math.min(tdX, W), dth)
    }

    // skillDuration 条（粉色）
    const sdX = timeToX(skillDuration)
    if (sdX > 0) {
      ctx.fillStyle = 'rgba(245,194,231,0.25)'
      ctx.fillRect(0, dty + 4, Math.min(sdX, W), dth - 8)
    }
    // skillDuration 右端 handle
    if (sdX >= 0 && sdX <= W) {
      ctx.fillStyle = '#f5c2e7'
      ctx.fillRect(sdX - 2, dty + 2, 4, dth - 4)
      // 顶部文字标注
      ctx.fillStyle = '#f5c2e7'
      ctx.font = 'bold 9px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(`${skillDuration.toFixed(2)}s`, Math.min(sdX, W - 20), dty + dth - 4)
    }
    // duration track 底部分隔线
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, dty + dth - 0.5)
    ctx.lineTo(W, dty + dth - 0.5)
    ctx.stroke()

    // ── 轨道背景 ─────────────────────────────────────────────────
    for (let i = 0; i < TRACKS.length; i++) {
      const ty = getTrackY(i)
      ctx.fillStyle = i % 2 === 0 ? '#1e1e2e' : '#232333'
      ctx.fillRect(0, ty, W, TRACKS[i].height)
    }

    // ── 网格线（垂直）─────────────────────────────────────────────
    const { minor } = calcTickStep(zoom)
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    const startT = Math.floor(scrollX / zoom / minor) * minor
    const endT = (scrollX + W) / zoom
    for (let t = startT; t <= endT + minor; t += minor) {
      const x = Math.round(timeToX(t)) + 0.5
      ctx.beginPath()
      ctx.moveTo(x, RULER_HEIGHT)
      ctx.lineTo(x, H)
      ctx.stroke()
    }

    // ── 事件绘制 ─────────────────────────────────────────────────
    for (let ti = 0; ti < TRACKS.length; ti++) {
      const track = TRACKS[ti]
      const ty = getTrackY(ti)
      const cy = ty + track.height / 2
      const trackEvents = events.filter(e => e.kind === track.kind)

      for (const event of trackEvents) {
        const isSelected = event.id === p.selectedEventId && event.kind === p.selectedEventKind
        const isHovered  = event.id === p.hoveredEventId  && event.kind === p.hoveredEventKind
        const alpha = isSelected ? 1 : isHovered ? 0.9 : 0.8

        if (isPointEvent(event)) {
          const ex = timeToX(event.triggerTime)
          if (ex < -20 || ex > W + 20) continue
          const r = isSelected ? POINT_EVENT_RADIUS + 2 : POINT_EVENT_RADIUS
          ctx.save()
          ctx.globalAlpha = alpha
          ctx.fillStyle = track.color
          if (isSelected) { ctx.shadowColor = track.color; ctx.shadowBlur = 8 }
          diamond(ctx, ex, cy, r)
          ctx.fill()
          ctx.restore()

        } else if (isDeriveEvent(event)) {
          const x1 = timeToX(event.deriveStart)
          const x2 = timeToX(event.deriveEnd)
          const barTop = ty + 6
          const barH   = track.height - 12

          // preInput 区域（半透明填充）
          if (event.enablePreInput) {
            const px = timeToX(event.preInputPoint)
            ctx.save()
            ctx.globalAlpha = 0.2
            ctx.fillStyle = track.color
            ctx.fillRect(Math.max(0, px), barTop, x1 - Math.max(0, px), barH)
            ctx.restore()

            // preInput 菱形标记（可拖拽提示）
            ctx.save()
            ctx.globalAlpha = 0.9
            ctx.fillStyle = track.color
            ctx.strokeStyle = '#fff'
            ctx.lineWidth = 1
            diamond(ctx, px, cy, POINT_EVENT_RADIUS - 1)
            ctx.fill()
            ctx.stroke()
            ctx.restore()
          }

          // 主派生窗口
          ctx.save()
          ctx.globalAlpha = alpha
          ctx.fillStyle = track.color
          if (isSelected) { ctx.shadowColor = track.color; ctx.shadowBlur = 8 }
          roundRect(ctx, x1, barTop, x2 - x1, barH, 3)
          ctx.fill()
          ctx.globalAlpha = 0.6
          ctx.fillStyle = '#fff'
          ctx.fillRect(x1, barTop, 3, barH)
          ctx.fillRect(x2 - 3, barTop, 3, barH)
          ctx.restore()

        } else {
          const ev = event as { startTime: number; endTime: number }
          const x1 = timeToX(ev.startTime)
          const x2 = timeToX(ev.endTime)
          const barTop = ty + 5
          const barH   = track.height - 10
          if (x2 < 0 || x1 > W) continue

          ctx.save()
          ctx.globalAlpha = alpha
          ctx.fillStyle = track.color
          if (isSelected) { ctx.shadowColor = track.color; ctx.shadowBlur = 8 }
          roundRect(ctx, x1, barTop, x2 - x1, barH, 3)
          ctx.fill()
          ctx.globalAlpha = 0.6
          ctx.fillStyle = '#fff'
          ctx.fillRect(x1, barTop, 3, barH)
          ctx.fillRect(x2 - 3, barTop, 3, barH)
          ctx.restore()
        }
      }
    }

    // ── 贯通虚线 + 时间提示 ──────────────────────────────────────
    if (p.cursorX !== null && p.cursorX >= 0 && p.cursorX <= W) {
      const cx = p.cursorX
      const curT = (cx + scrollX) / zoom

      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'
      ctx.setLineDash([3, 4])
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx + 0.5, RULER_HEIGHT)
      ctx.lineTo(cx + 0.5, H)
      ctx.stroke()
      ctx.setLineDash([])

      // 时间气泡（在 ruler 底部）
      const label = `${curT.toFixed(2)}s`
      ctx.font = 'bold 10px system-ui'
      const tw = ctx.measureText(label).width + 8
      const bx = Math.min(cx - tw / 2, W - tw - 2)
      const by = RULER_HEIGHT - 14
      ctx.fillStyle = 'rgba(30,30,46,0.85)'
      ctx.beginPath()
      ctx.roundRect?.(bx, by, tw, 12, 3) ?? ctx.rect(bx, by, tw, 12)
      ctx.fill()
      ctx.fillStyle = '#cdd6f4'
      ctx.textAlign = 'center'
      ctx.fillText(label, cx, by + 9)
      ctx.restore()
    }

    // ── 时间刻度尺（最后绘制覆盖虚线）──────────────────────────
    ctx.fillStyle = '#252535'
    ctx.fillRect(0, 0, W, RULER_HEIGHT)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, RULER_HEIGHT - 0.5)
    ctx.lineTo(W, RULER_HEIGHT - 0.5)
    ctx.stroke()

    const { major } = calcTickStep(zoom)
    const minorStep = major / 5
    const tStart = Math.floor(scrollX / zoom / minorStep) * minorStep
    const tEnd   = (scrollX + W) / zoom

    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.fillStyle   = '#a6adc8'
    ctx.font        = '10px system-ui'
    ctx.textAlign   = 'center'

    for (let t = tStart; t <= tEnd + minorStep; t = +(t + minorStep).toFixed(10)) {
      const x = Math.round(timeToX(t)) + 0.5
      const isMajor = Math.abs(Math.round(t / major) * major - t) < 0.001
      ctx.lineWidth = isMajor ? 1 : 0.5
      ctx.beginPath()
      ctx.moveTo(x, RULER_HEIGHT - (isMajor ? 10 : 5))
      ctx.lineTo(x, RULER_HEIGHT)
      ctx.stroke()
      if (isMajor && x > 20 && x < W - 10) {
        ctx.fillText(`${t.toFixed(2)}s`, x, RULER_HEIGHT - 12)
      }
    }

    ctx.restore()
  }, [])

  return render
}

function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x, y - r)
  ctx.lineTo(x + r, y)
  ctx.lineTo(x, y + r)
  ctx.lineTo(x - r, y)
  ctx.closePath()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2
  if (h < 2 * r) r = h / 2
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export { getTotalHeight, CANVAS_PADDING_RIGHT }
