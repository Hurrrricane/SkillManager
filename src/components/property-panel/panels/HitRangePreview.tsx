import { useRef, useEffect, useCallback } from 'react'
import { HitEvent, EHitShape } from '@/types'
import styles from './HitRangePreview.module.css'

const HIT_COLOR = '#e74c3c'

// ── Bounding box ──────────────────────────────────────────────────────────────

function computeBBox(ev: HitEvent) {
  const { offsetX: ox, offsetY: oy, shape, shapeParam1: p1, shapeParam2: p2 } = ev
  let minX = -1, maxX = 1, minY = -1, maxY = 1

  const expand = (x: number, y: number) => {
    if (x < minX) minX = x; if (x > maxX) maxX = x
    if (y < minY) minY = y; if (y > maxY) maxY = y
  }

  if (shape === EHitShape.Circle) {
    expand(ox - p1, oy - p1); expand(ox + p1, oy + p1)
  } else if (shape === EHitShape.Rectangle) {
    expand(ox - p1, oy - p2); expand(ox + p1, oy + p2)
  } else {
    // Fan: pivot = (ox, oy), points in +Y, full angle = p2 deg, radius = p1
    expand(ox, oy)
    const H = (p2 / 2) * Math.PI / 180
    const steps = 48
    for (let i = 0; i <= steps; i++) {
      const a = -H + (2 * H * i / steps) // angle from +Y axis
      expand(ox + p1 * Math.sin(a), oy + p1 * Math.cos(a))
    }
  }

  return { minX, maxX, minY, maxY }
}

// ── Grid step ─────────────────────────────────────────────────────────────────

function calcGridStep(scale: number): number {
  const candidates = [0.25, 0.5, 1, 2, 5, 10]
  return candidates.find(s => s * scale >= 32) ?? 10
}

// ── Draw helpers ──────────────────────────────────────────────────────────────

function drawGrid(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  camX: number, camY: number,
  scale: number,
  toSX: (x: number) => number,
  toSY: (y: number) => number,
) {
  const step = calcGridStep(scale)
  const startX = Math.floor((camX - W / 2 / scale) / step) * step
  const startY = Math.floor((camY - H / 2 / scale) / step) * step
  const endX   = camX + W / 2 / scale + step
  const endY   = camY + H / 2 / scale + step

  ctx.lineWidth = 1
  for (let gx = startX; gx <= endX; gx += step) {
    const isAxis = Math.abs(gx) < step * 0.01
    ctx.strokeStyle = isAxis ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)'
    ctx.beginPath(); ctx.moveTo(toSX(gx), 0); ctx.lineTo(toSX(gx), H); ctx.stroke()
  }
  for (let gy = startY; gy <= endY; gy += step) {
    const isAxis = Math.abs(gy) < step * 0.01
    ctx.strokeStyle = isAxis ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)'
    ctx.beginPath(); ctx.moveTo(0, toSY(gy)); ctx.lineTo(W, toSY(gy)); ctx.stroke()
  }

  // Ruler labels along edges
  ctx.fillStyle = 'rgba(166,173,200,0.55)'
  ctx.font = '9px system-ui'
  const fmt = (v: number) => v.toFixed(step < 1 ? 2 : 0)

  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
  for (let gx = startX; gx <= endX; gx += step) {
    if (Math.abs(gx) < step * 0.01) continue
    const sx = toSX(gx)
    if (sx > 14 && sx < W - 4) ctx.fillText(fmt(gx), sx, H - 2)
  }
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
  for (let gy = startY; gy <= endY; gy += step) {
    if (Math.abs(gy) < step * 0.01) continue
    const sy = toSY(gy)
    if (sy > 4 && sy < H - 14) ctx.fillText(fmt(gy), W - 3, sy)
  }
}

function drawHitShape(
  ctx: CanvasRenderingContext2D,
  ev: HitEvent,
  toSX: (x: number) => number,
  toSY: (y: number) => number,
  scale: number,
) {
  const { shape, offsetX: ox, offsetY: oy, shapeParam1: p1, shapeParam2: p2 } = ev
  const sx = toSX(ox), sy = toSY(oy)

  ctx.fillStyle = HIT_COLOR + '30'   // ~19% opacity
  ctx.strokeStyle = HIT_COLOR
  ctx.lineWidth = 1.5

  if (shape === EHitShape.Circle) {
    const r = p1 * scale
    ctx.beginPath(); ctx.arc(sx, sy, Math.max(r, 1), 0, Math.PI * 2)
    ctx.fill(); ctx.stroke()

  } else if (shape === EHitShape.Rectangle) {
    const hw = p1 * scale, hh = p2 * scale
    ctx.beginPath(); ctx.rect(sx - hw, sy - hh, hw * 2, hh * 2)
    ctx.fill(); ctx.stroke()

  } else {
    // Fan: pivot at (sx, sy), pointing up in canvas (-Y), full angle p2
    const r = p1 * scale
    const H = (p2 / 2) * Math.PI / 180
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    // In canvas: up = -π/2; fan spans [-π/2 - H, -π/2 + H] clockwise = upper arc
    ctx.arc(sx, sy, Math.max(r, 1), -Math.PI / 2 - H, -Math.PI / 2 + H)
    ctx.closePath()
    ctx.fill(); ctx.stroke()
  }

  // Dashed line from origin to shape center (when offset != 0)
  if (ox !== 0 || oy !== 0) {
    ctx.save()
    ctx.strokeStyle = 'rgba(231,76,60,0.3)'
    ctx.lineWidth = 1; ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.moveTo(toSX(0), toSY(0)); ctx.lineTo(sx, sy)
    ctx.stroke(); ctx.setLineDash([])
    ctx.restore()
  }

  // Center dot
  ctx.fillStyle = HIT_COLOR
  ctx.beginPath(); ctx.arc(sx, sy, 2.5, 0, Math.PI * 2); ctx.fill()
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number,
  scale: number,
) {
  const r = Math.max(5, scale)   // world radius=1 → scale px, min 5px visible

  // Body
  ctx.fillStyle = 'rgba(137,180,250,0.12)'
  ctx.strokeStyle = 'rgba(255,255,255,0.65)'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2)
  ctx.fill(); ctx.stroke()

  // Forward arrow (pointing up = -Y in canvas)
  const arrowLen = r * 0.75
  const headSz   = Math.max(3.5, r * 0.28)
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.fillStyle   = 'rgba(255,255,255,0.9)'
  ctx.lineWidth   = 1.5
  ctx.beginPath()
  ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - arrowLen)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(sx, sy - arrowLen)
  ctx.lineTo(sx - headSz, sy - arrowLen + headSz * 1.6)
  ctx.lineTo(sx + headSz, sy - arrowLen + headSz * 1.6)
  ctx.closePath(); ctx.fill()
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HitRangePreview({ event }: { event: HitEvent }) {
  const wrapperRef = useRef<HTMLDivElement>(null!)
  const canvasRef  = useRef<HTMLCanvasElement>(null!)
  const zoomMulRef = useRef(1)
  const sizeRef    = useRef(0)
  const dirtyRef   = useRef(true)
  const rafRef     = useRef(0)
  const eventRef   = useRef(event)
  eventRef.current = event

  // Draw function (reads from refs, no closure deps)
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const S = sizeRef.current
    if (!canvas || S === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const ev    = eventRef.current
    const dpr   = window.devicePixelRatio || 1
    const W = S, H = S

    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    // Background
    ctx.fillStyle = '#13131f'
    ctx.fillRect(0, 0, W, H)

    // Auto-fit camera
    const bbox   = computeBBox(ev)
    const bboxW  = Math.max(bbox.maxX - bbox.minX, 0.1)
    const bboxH  = Math.max(bbox.maxY - bbox.minY, 0.1)
    const autoSc = Math.min(W, H) / (Math.max(bboxW, bboxH) * 1.4)
    const scale  = autoSc * zoomMulRef.current

    const camX = (bbox.minX + bbox.maxX) / 2
    const camY = (bbox.minY + bbox.maxY) / 2
    const toSX = (wx: number) => W / 2 + (wx - camX) * scale
    const toSY = (wy: number) => H / 2 - (wy - camY) * scale

    drawGrid(ctx, W, H, camX, camY, scale, toSX, toSY)

    // Forward label
    ctx.fillStyle = 'rgba(166,173,200,0.35)'
    ctx.font = '9px system-ui'
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    ctx.fillText('▲ Forward', W / 2, 4)

    drawHitShape(ctx, ev, toSX, toSY, scale)
    drawPlayer(ctx, toSX(0), toSY(0), scale)

    // Zoom hint
    if (zoomMulRef.current !== 1) {
      ctx.fillStyle = 'rgba(166,173,200,0.5)'
      ctx.font = '9px system-ui'
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'
      ctx.fillText(`×${zoomMulRef.current.toFixed(1)}  双击重置`, 5, H - 4)
    }

    ctx.restore()
  }, [])

  // RAF loop
  useEffect(() => {
    dirtyRef.current = true
    const loop = () => {
      if (dirtyRef.current) { dirtyRef.current = false; draw() }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw])

  // Mark dirty when event changes
  useEffect(() => { dirtyRef.current = true }, [event])

  // Resize observer: compute square size = min(containerWidth, 15vh)
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const ro = new ResizeObserver(() => {
      const w   = wrapper.clientWidth
      const maxH = window.innerHeight * 0.15
      const s   = Math.floor(Math.min(w, maxH))
      if (s === sizeRef.current || s < 10) return
      sizeRef.current = s
      const canvas = canvasRef.current
      if (canvas) {
        const dpr = window.devicePixelRatio || 1
        canvas.width  = s * dpr
        canvas.height = s * dpr
        canvas.style.width  = `${s}px`
        canvas.style.height = `${s}px`
      }
      dirtyRef.current = true
    })
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
    zoomMulRef.current = Math.max(0.1, Math.min(20, zoomMulRef.current * factor))
    dirtyRef.current = true
  }, [])

  const onDblClick = useCallback(() => {
    zoomMulRef.current = 1
    dirtyRef.current = true
  }, [])

  return (
    <div ref={wrapperRef} className={styles.wrapper} onWheel={onWheel} onDoubleClick={onDblClick}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  )
}
