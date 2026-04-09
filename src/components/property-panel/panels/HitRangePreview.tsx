import { HitEvent } from '@/types'
import { ShapePreview } from './ShapePreview'

export function HitRangePreview({ event }: { event: HitEvent }) {
  return (
    <ShapePreview
      shape={event.shape}
      offsetX={event.offsetX}
      offsetY={event.offsetY}
      shapeParam1={event.shapeParam1}
      shapeParam2={event.shapeParam2}
    />
  )
}
