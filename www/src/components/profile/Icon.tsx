import { TrashCanIcon } from 'pluralsh-design-system'
import { ReactNode, forwardRef } from 'react'
import { DivProps, Flex } from 'honorable'
import { useTheme } from 'styled-components'

type Hue = 'none' | 'default' | 'lighter' | 'lightest'

const hueToHoverBG: Record<Hue, string> = {
  none: 'fill-zero-hover',
  default: 'fill-one-hover',
  lighter: 'fill-two-hover',
  lightest: 'fill-three-hover',
}

type IconProps = DivProps & {
  icon: ReactNode
  hue?: Hue
  hover?: string
}

export const Icon = forwardRef<HTMLDivElement, IconProps>(({
  icon, hover, hue, ...props
}, ref) => {
  const theme = useTheme()

  return (
    <Flex
      ref={ref}
      flex={false}
      padding={theme.spacing.xsmall}
      borderRadius="medium"
      cursor="pointer"
      {...{ '&:focus,&:focus-visible': { outline: 'none' } }}
      _focusVisible={{ ...theme.partials.focus.default }}
      _hover={{
        backgroundColor:
            hover || (hue ? theme.colors[hueToHoverBG[hue]] : 'fill-two'),
      }}
      {...props}
    >
      {icon}
    </Flex>
  )
})

export const DeleteIcon = forwardRef<HTMLDivElement, Omit<IconProps, 'icon'>>(({ ...props }, ref) => (
  <Icon
    ref={ref}
    icon={(
      <TrashCanIcon
        size={16}
        color="icon-error"
      />
    )}
    {...props}
  />
))
