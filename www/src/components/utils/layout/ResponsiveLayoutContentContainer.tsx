import { Flex, type FlexProps } from '@pluralsh/design-system'
import styled from 'styled-components'

const ContentContainerSC = styled(Flex)(({ theme }) => ({
  [`@media (min-width: ${theme.breakpoints.desktopLarge}px)`]: {
    maxWidth: 896,
    width: 896,
  },
}))

export function ResponsiveLayoutContentContainer(props: FlexProps) {
  return (
    <ContentContainerSC
      direction="column"
      grow={1}
      shrink={1}
      height="100%"
      minWidth={0}
      minHeight={0}
      maxHeight="100%"
      width={896}
      overflowY="auto"
      overflowX="hidden"
      {...props}
    />
  )
}
