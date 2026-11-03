import { Flex, type FlexProps } from '@pluralsh/design-system'

export function SideNavOffset(props: FlexProps) {
  return (
    <Flex
      direction="column"
      marginLeft="minus-medium"
      {...props}
    />
  )
}
