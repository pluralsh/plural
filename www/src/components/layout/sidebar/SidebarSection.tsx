import { Flex, FlexProps } from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

export function SidebarSection({ grow = 0, ...props }: FlexProps) {
  const { borders } = useTheme()

  return (
    <Flex
      direction="column"
      grow={grow}
      align="center"
      gap="xxsmall"
      padding="small"
      width="100%"
      {...props}
      css={{
        borderBottom: borders.default,
        '&:last-of-type': { border: 'none' },
        ...props.css,
      }}
    />
  )
}
