import { TrashCanIcon } from 'pluralsh-design-system'
import { forwardRef } from 'react'

import { IconFrame, IconProps } from './IconFrame'

export const DeleteIconButton = forwardRef<HTMLDivElement, Partial<IconProps>>(({
  size, clickable, textValue, ...props
}, ref) => (
  <IconFrame
    ref={ref}
    size={size || 'medium'}
    clickable={clickable === undefined ? true : clickable}
    icon={<TrashCanIcon color="icon-error" />}
    textValue={textValue || 'Delete'}
    {...props}
  />
))
