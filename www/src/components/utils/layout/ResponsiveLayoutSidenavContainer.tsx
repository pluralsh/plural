import { Flex, type FlexProps } from '@pluralsh/design-system'

export function ResponsiveLayoutSidenavContainer(props: FlexProps) {
  return (
    <Flex
      direction="column"
      marginRight="xlarge"
      minWidth={0}
      minHeight={0}
      shrink={0}
      width={240}
      {...props}
    />
  )
}
