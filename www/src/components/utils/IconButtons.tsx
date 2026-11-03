import {
  IconFrame,
  IconFrameProps,
  TrashCanIcon,
} from '@pluralsh/design-system'
import { Ref } from 'react'
import { useTheme } from 'styled-components'

export const DeleteIconButton = ({
  size,
  clickable,
  textValue,
  disabled,
  ref,
  ...props
}: Partial<IconFrameProps> & { disabled?: boolean } & {
  ref?: Ref<HTMLDivElement>
}) => {
  const theme = useTheme()

  return (
    <IconFrame
      ref={ref}
      size={size || 'small'}
      clickable={disabled ? false : clickable === undefined ? true : clickable}
      icon={
        <TrashCanIcon
          color={
            disabled
              ? theme.colors['text-disabled']
              : theme.colors['icon-danger']
          }
        />
      }
      textValue={textValue || 'Delete'}
      {...props}
    />
  )
}
