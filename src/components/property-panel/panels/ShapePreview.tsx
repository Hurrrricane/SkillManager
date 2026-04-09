/**
 * Generic top-down shape preview canvas.
 * Used by HitEventPanel and PersistentHitEventPanel.
 */
import { useRef, useEffect, useCallback } from 'react'
import { EHitShape } from '@/types'
import styles from './HitRangePreview.module.css'

export interface ShapePreviewProps {
  shape: EHitShape
  offsetX: number
  offsetY: number
  shapeParam1: number
  shapeParam2: number
  showWaveArrow?: boolean   // Wave subtype: draw a forward movement arrow
}

const SHAPE_COLOR = '#e74c3c'

// ── Bbox ──────────────────────────────────────────────────────────────────────

export function computeShapeBBox(p: ShapePreviewProps) {
  const { offsetX: ox, offsetY: oy, shape, shapeParam1: p1, shapeParam2: p2 } = p
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
    // Fan: pivot at (ox, oy), points +Y, full angle = p2 deg
    expand(ox, oy)
    const H = (p2 / 2) * Math.PI / 180
    for (let i = 0; i <= 48; i++) {
      const a = -H + (2 * H * i / 48)
      expand(ox + p1 * Math.sin(a), oy + p1 * Math.cos(a))
    }
  }
  return { minX, maxX, minY, maxY }
}

// ── Draw helpers ─────────────────────────────────────────────────────────────

function calcGridStep(scale: number) {
  const candidates = [0.25, 0.5, 1, 2, 5, 10]
  return candidates.find(s => s * scale >= 32) ?? 10
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  camX: number, camY: number,
  scale: number,
  toSX: (x: number) => number,
  toSY: (y: number) => number,
) {
  const step = calcGridStep(scale)
  const x0 = Math.floor((camX - W / 2 / scale) / step) * step
  const y0 = Math.floor((camY - H / 2 / scale) / step) * step
  const x1 = camX + W / 2 / scale + step
  const y1 = camY + H / 2 / scale + step

  ctx.lineWidth = 1
  for (let gx = x0; gx <= x1; gx += step) {
    ctx.strokeStyle = Math.abs(gx) < step * 0.01 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)'
    ctx.beginPath(); ctx.moveTo(toSX(gx), 0); ctx.lineTo(toSX(gx), H); ctx.stroke()
  }
  for (let gy = y0; gy <= y1; gy += step) {
    ctx.strokeStyle = Math.abs(gy) < step * 0.01 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)'
    ctx.beginPath(); ctx.moveTo(0, toSY(gy)); ctx.lineTo(W, toSY(gy)); ctx.stroke()
  }

  ctx.fillStyle = 'rgba(166,173,200,0.55)'
  ctx.font = '9px system-ui'
  const fmt = (v: number) => v.toFixed(step < 1 ? 2 : 0)
  for (let gx = x0; gx <= x1; gx += step) {
    if (Math.abs(gx) < step * 0.01) continue
    const sx = toSX(gx)
    if (sx > 14 && sx < W - 4) {
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(fmt(gx), sx, H - 2)
    }
  }
  for (let gy = y0; gy <= y1; gy += step) {
    if (Math.abs(gy) < step * 0.01) continue
    const sy = toSY(gy)
    if (sy > 4 && sy < H - 14) {
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(fmt(gy), W - 3, sy)
    }
  }
}

export function drawShape(
  ctx: CanvasRenderingContext2D,
  p: ShapePreviewProps,
  toSX: (x: number) => number,
  toSY: (y: number) => number,
  scale: number,
  color = SHAPE_COLOR,
) {
  const { shape, offsetX: ox, offsetY: oy, shapeParam1: p1, shapeParam2: p2 } = p
  const sx = toSX(ox), sy = toSY(oy)

  ctx.fillStyle = color + '30'
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5

  if (shape === EHitShape.Circle) {
    ctx.beginPath(); ctx.arc(sx, sy, Math.max(p1 * scale, 1), 0, Math.PI * 2)
    ctx.fill(); ctx.stroke()
  } else if (shape === EHitShape.Rectangle) {
    const hw = p1 * scale, hh = p2 * scale
    ctx.beginPath(); ctx.rect(sx - hw, sy - hh, hw * 2, hh * 2)
    ctx.fill(); ctx.stroke()
  } else {
    const r = Math.max(p1 * scale, 1)
    const H = (p2 / 2) * Math.PI / 180
    ctx.beginPath(); ctx.moveTo(sx, sy)
    ctx.arc(sx, sy, r, -Math.PI / 2 - H, -Math.PI / 2 + H)
    ctx.closePath(); ctx.fill(); ctx.stroke()
  }

  // Dashed line from origin to shape center
  if (ox !== 0 || oy !== 0) {
    ctx.save()
    ctx.strokeStyle = color + '50'; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.moveTo(toSX(0), toSY(0)); ctx.lineTo(sx, sy)
    ctx.stroke(); ctx.setLineDash([])
    ctx.restore()
  }

  // Center dot
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(sx, sy, 2.5, 0, Math.PI * 2); ctx.fill()
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number, scale: number,
) {
  const r = Math.max(5, scale)
  ctx.fillStyle = 'rgba(137,180,250,0.12)'
  ctx.strokeStyle = 'rgba(255,255,255,0.65)'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2)
  ctx.fill(); ctx.stroke()

  const arrowLen = r * 0.75
  const headSz   = Math.max(3.5, r * 0.28)
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.fillStyle   = 'rgba(255,255,255,0.9)'
  ctx.lineWidth   = 1.5
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - arrowLen); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(sx, sy - arrowLen)
  ctx.lineTo(sx - headSz, sy - arrowLen + headSz * 1.6)
  ctx.lineTo(sx + headSz, sy - arrowLen + headSz * 1.6)
  ctx.closePath(); ctx.fill()
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ShapePreview({ shape, offsetX, offsetY, shapeParam1, shapeParam2, showWaveArrow }: ShapePreviewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null!)
  const canvasRef  = useRef<HTMLCanvasElement>(null!)
  const zoomMulRef = useRef(1)
  const sizeRef    = useRef(0)
  const dirtyRef   = useRef(true)
  const rafRef     = useRef(0)
  const propsRef   = useRef<ShapePreviewProps>({ shape, offsetX, offsetY, shapeParam1, shapeParam2, showWaveArrow })
  propsRef.current = { shape, offsetX, offsetY, shapeParam1, shapeParam2, showWaveArrow }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const S = sizeRef.current
    if (!canvas || S === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const p   = propsRef.current
    const dpr = window.devicePixelRatio || 1
    const W = S, H = S

    ctx.save(); ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#13131f'; ctx.fillRect(0, 0, W, H)

    // Auto-fit
    const bbox  = computeShapeBBox(p)
    const bboxW = Math.max(bbox.maxX - bbox.minX, 0.1)
    const bboxH = Math.max(bbox.maxY - bbox.minY, 0.1)

    // For Wave: extend bbox forward to hint at movement
    const waveExtend = p.showWaveArrow ? Math.min(p.shapeParam1 * 2, 3) : 0
    const effectiveBboxH = Math.max(bboxH, bbox.maxY - bbox.minY + waveExtend)

    const autoSc = Math.min(W, H) / (Math.max(bboxW, effectiveBboxH) * 1.4)
    const scale  = autoSc * zoomMulRef.current
    const camX   = (bbox.minX + bbox.maxX) / 2
    const camY   = (bbox.minY + bbox.maxY) / 2 + waveExtend / 2

    const toSX = (wx: number) => W / 2 + (wx - camX) * scale
    const toSY = (wy: number) => H / 2 - (wy - camY) * scale

    drawGrid(ctx, W, H, camX, camY, scale, toSX, toSY)

    // Forward label
    ctx.fillStyle = 'rgba(166,173,200,0.35)'
    ctx.font = '9px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    ctx.fillText('▲ Forward', W / 2, 4)

    drawShape(ctx, p, toSX, toSY, scale)

    // Wave movement arrow
    if (p.showWaveArrow && waveExtend > 0) {
      const ox = p.offsetX, oy = p.offsetY
      const sx = toSX(ox), sy = toSY(oy)
      const arrowEndY = toSY(oy + waveExtend)
      ctx.save()
      ctx.strokeStyle = '#FF7675'; ctx.lineWidth = 1.5
      ctx.setLineDash([4, 3])
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, arrowEndY); ctx.stroke()
      ctx.setLineDash([])
      const hs = 5
      ctx.fillStyle = '#FF7675'
      ctx.beginPath()
      ctx.moveTo(sx, arrowEndY); ctx.lineTo(sx - hs, arrowEndY + hs * 1.5); ctx.lineTo(sx + hs, arrowEndY + hs * 1.5)
      ctx.closePath(); ctx.fill()
      ctx.restore()
    }

    drawPlayer(ctx, toSX(0), toSY(0), scale)

    if (zoomMulRef.current !== 1) {
      ctx.fillStyle = 'rgba(166,173,200,0.5)'; ctx.font = '9px system-ui'
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'
      ctx.fillText(`×${zoomMulRef.current.toFixed(1)}  双击重置`, 5, H - 4)
    }

    ctx.restore()
  }, [])

  useEffect(() => {
    dirtyRef.current = true
    const loop = () => {
      if (dirtyRef.current) { dirtyRef.current = false; draw() }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw])

  useEffect(() => { dirtyRef.current = true }, [shape, offsetX, offsetY, shapeParam1, shapeParam2, showWaveArrow])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const ro = new ResizeObserver(() => {
      const w = wrapper.clientWidth
      const maxH = window.innerHeight * 0.15
      const s = Math.floor(Math.min(w, maxH))
      if (s === sizeRef.current || s < 10) return
      sizeRef.current = s
      const canvas = canvasRef.current
      if (canvas) {
        const dpr = window.devicePixelRatio || 1
        canvas.width  = s * dpr; canvas.height = s * dpr
        canvas.style.width = `${s}px`; canvas.style.height = `${s}px`
      }
      dirtyRef.current = true
    })
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault(); e.stopPropagation()
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
      zoomMulRef.current = Math.max(0.1, Math.min(20, zoomMulRef.current * factor))
      dirtyRef.current = true
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  const onDblClick = useCallback(() => { zoomMulRef.current = 1; dirtyRef.current = true }, [])

  return (
    <div ref={wrapperRef} className={styles.wrapper} onDoubleClick={onDblClick}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  )
}
