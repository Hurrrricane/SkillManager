import { create } from 'zustand'
import { AnyEvent } from '@/types'

interface SelectedEvent {
  id: number
  kind: AnyEvent['kind']
  skillId: number
}

interface UIStore {
  selectedEvent: SelectedEvent | null
  timelineZoom: number    // px/s
  timelineScrollX: number // 横向滚动偏移（px）
  panelWidth: number      // 右侧属性面板宽度（px）
  cursorX: number | null  // canvas 内鼠标 X（用于绘制贯通虚线）

  selectEvent: (event: SelectedEvent | null) => void
  setZoom: (zoom: number) => void
  setScrollX: (x: number) => void
  setPanelWidth: (w: number) => void
  setCursorX: (x: number | null) => void
}

export const useUIStore = create<UIStore>((set) => ({
  selectedEvent: null,
  timelineZoom: 200,
  timelineScrollX: 0,
  panelWidth: 320,
  cursorX: null,

  selectEvent: (event) => set({ selectedEvent: event }),
  setZoom: (zoom) => set({ timelineZoom: Math.max(50, Math.min(2000, zoom)) }),
  setScrollX: (x) => set({ timelineScrollX: Math.max(0, x) }),
  setPanelWidth: (w) => set({ panelWidth: Math.max(240, Math.min(600, w)) }),
  setCursorX: (x) => set({ cursorX: x }),
}))
