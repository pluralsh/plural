import { Flex } from 'honorable'

export function ResponsiveLayoutContentContainer(props: any) {
  return (
    <Flex
      direction="column"
      flexGrow={1}
      flexShrink={1}
      height="100%"
      maxHeight="100%"
      width={896}
      maxWidth-desktopLarge-up={896}
      width-desktopLarge-up={896}
      overflowY="auto"
      overflowX="hidden"
      {...props}
    />
  )
}
