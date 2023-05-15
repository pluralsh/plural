import {
  IconFrame,
  IconFrameProps,
  TrashCanIcon,
} from '@pluralsh/design-system'
import { forwardRef } from 'react'

export const DeleteIconButton = forwardRef<
  HTMLDivElement,
  Partial<IconFrameProps>
>(({ size, clickable, textValue, ...props }, ref) => (
  <IconFrame
    ref={ref}
    size={size || 'medium'}
    clickable={clickable === undefined ? true : clickable}
    icon={<TrashCanIcon color="icon-danger" />}
    textValue={textValue || 'Delete'}
    {...props}
  />
))
