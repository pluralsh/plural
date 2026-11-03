import { Flex, type FlexProps } from '@pluralsh/design-system'
import styled from 'styled-components'

const SidecarContainerSC = styled(Flex)(({ theme }) => ({
  [`@media (max-width: ${theme.breakpoints.desktop - 1}px)`]: {
    display: 'none',
  },
}))

export function ResponsiveLayoutSidecarContainer(props: FlexProps) {
  return (
    <SidecarContainerSC
      direction="column"
      marginLeft="xlarge"
      width={200}
      shrink={0}
      {...props}
    />
  )
}
