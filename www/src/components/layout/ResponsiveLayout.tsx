import { Div, Flex } from 'honorable'

export function ResponsiveLayoutSpacer() {
  return (
    <Div
      flexGrow={1}
      display-desktopLarge-down="none"
    />
  )
}

export function ResponsiveLayoutSidenavContainer(props: any) {
  return (
    <Div
      marginRight="xlarge"
      {...props}
    />
  )
}

export function ResponsiveLayoutSidecarContainer(props: any) {
  return (
    <Div
      marginLeft="xlarge"
      display-desktop-down="none"
      {...props}
    />
  )
}

export function ResponsiveLayoutContentContainer(props: any) {
  return (
    <Flex
      direction="column"
      flexGrow={1}
      flexShrink={1}
      height="100%"
      maxHeight="100%"
      maxWidth-desktopLarge-up={896}
      width-desktopLarge-up={896}
      overflowY="auto"
      overflowX="hidden"
      {...props}
    />
  )
}
