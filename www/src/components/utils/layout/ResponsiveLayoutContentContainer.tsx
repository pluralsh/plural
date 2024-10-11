import { Flex } from 'honorable'

import { forwardRef } from 'react'

export const ResponsiveLayoutContentContainer = forwardRef(
  (props: any, ref) => (
    <Flex
      direction="column"
      flexGrow={1}
      flexShrink={1}
      height="100%"
      minWidth={0}
      minHeight={0}
      maxHeight="100%"
      width={896}
      maxWidth-desktopLarge-up={896}
      width-desktopLarge-up={896}
      overflowY="auto"
      overflowX="hidden"
      ref={ref}
      {...props}
    />
  )
)
