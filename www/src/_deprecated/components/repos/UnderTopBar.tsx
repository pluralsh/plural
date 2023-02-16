import { Flex, FlexProps } from 'honorable'

export function UnderTopBar(props: FlexProps) {
  return (
    <Flex
      // Prevents cropping of hover effects on tab items
      marginLeft="minus-medium"
      paddingLeft="medium"
      //
      paddingTop="medium"
      height="100%"
      width="100%"
      flexGrow={1}
      overflowY="hidden"
      {...props}
    />
  )
}
