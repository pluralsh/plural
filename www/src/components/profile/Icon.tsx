/* To be implemented as IconFrame in the design system once the transition from
the old IconFrame to AppIcon is complete */

import { Tooltip, TrashCanIcon } from 'pluralsh-design-system'
import {
  ReactElement, ReactNode, cloneElement, forwardRef,
} from 'react'
import { ButtonBase, DivProps, Flex } from 'honorable'
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
  hue?: Hue
  clickable?: boolean
  textValue: string
  tooltip?: boolean | ReactNode
  icon: ReactElement
}

export const Icon = forwardRef<HTMLDivElement, IconProps>(({
  icon,
  size = 'medium',
  hue = 'default',
  textValue,
  clickable = false,
  tooltip,
  ...props
},
ref) => {
  const theme = useTheme()

  icon = cloneElement(icon, { size: sizeToIconSize[size] })
  if (tooltip && typeof tooltip === 'boolean') {
    tooltip = textValue
  }

  let content = (
    <Flex
      ref={ref}
      flex={false}
      alignItems="center"
      justifyContent="center"
      width={sizeToFrameSize[size]}
      height={sizeToFrameSize[size]}
      borderRadius={theme.borderRadiuses.medium}
      aria-label={textValue}
      {...{ '&:focus,&:focus-visible': { outline: 'none' } }}
      _focusVisible={{ ...theme.partials.focus.default }}
      {...{
        '&,&:any-link': {
          textDecoration: 'none',
          border: 'unset',
          background: 'unset',
          color: 'unset',
          appearance: 'unset',
        },
      }}
      {...(clickable && {
        as: ButtonBase,
        tabIndex: 0,
        role: 'button',
        cursor: 'pointer',
        '&:hover, &:active': {
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

  if (tooltip) {
    content = (
      <Tooltip
        strategy="fixed"
        displayOn="manual"
        manualOpen
        arrow
        placement="top"
        label={tooltip}
        // zIndex={999999999}
      >
        {content}
      </Tooltip>
    )
  }

  return content
})

export const DeleteIcon = forwardRef<HTMLDivElement, Partial<IconProps>>(({
  size, clickable, textValue, ...props
}, ref) => (
  <Icon
    ref={ref}
    size={size || 'medium'}
    clickable={clickable === undefined ? true : clickable}
    icon={<TrashCanIcon color="icon-error" />}
    textValue={textValue || 'Delete'}
    {...props}
  />
))
