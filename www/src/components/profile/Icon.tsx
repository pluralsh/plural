/* To be implemented as IconFrame in the design system once the transition from
the old IconFrame to AppIcon is complete */

import { TrashCanIcon } from 'pluralsh-design-system'
import { ReactElement, cloneElement, forwardRef } from 'react'
import { DivProps, Flex } from 'honorable'
import { useTheme } from 'styled-components'

type Hue = 'none' | 'default' | 'lighter' | 'lightest'
type Size = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'

const hueToHoverBG: Record<Hue, string> = {
  none: 'fill-zero-hover',
  default: 'fill-one-hover',
  lighter: 'fill-two-hover',
  lightest: 'fill-three-hover',
}

const sizeToIconSize: Record<Size, number> = {
  xsmall: 8,
  small: 16,
  medium: 16,
  large: 24,
  xlarge: 24,
}

const sizeToFrameSize: Record<Size, number> = {
  xsmall: 16,
  small: 24,
  medium: 32,
  large: 40,
  xlarge: 48,
}

type IconProps = DivProps & {
  icon: ReactElement
  hue?: Hue
  clickable?: boolean
}

export const Icon = forwardRef<HTMLDivElement, IconProps>(({
  icon, size = 'medium', hue = 'default', clickable = false, ...props
},
ref) => {
  const theme = useTheme()

  icon = cloneElement(icon, { size: sizeToIconSize[size] })

  return (
    <Flex
      ref={ref}
      flex={false}
      alignItems="center"
      justifyContent="center"
      width={sizeToFrameSize[size]}
      height={sizeToFrameSize[size]}
      borderRadius={theme.borderRadiuses.medium}
      {...{ '&:focus,&:focus-visible': { outline: 'none' } }}
      _focusVisible={{ ...theme.partials.focus.default }}
      {...(clickable && {
        tabIndex: 0,
        role: 'button',
        cursor: 'pointer',
        _hover: {
          backgroundColor:
              clickable
              && (theme.colors[hueToHoverBG[hue]]
                || theme.colors[hueToHoverBG.default]),
        },
      })}
      {...props}
    >
      {icon}
    </Flex>
  )
})

export const DeleteIcon = forwardRef<HTMLDivElement, Omit<IconProps, 'icon'>>(({ size, clickable, ...props }, ref) => (
  <Icon
    ref={ref}
    size={size || 'medium'}
    clickable={clickable === undefined ? true : clickable}
    icon={<TrashCanIcon color="icon-error" />}
    {...props}
  />
))
