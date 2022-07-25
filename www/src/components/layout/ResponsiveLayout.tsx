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
      marginRight="large"
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
      maxWidth-desktop-up={896}
      minWidth-desktopLarge={832}
      minWidth-desktopLarge-up={832}
      minWidth-desktopLarge-down={672}
      height="100%"
      maxHeight="100%"
      paddingBottom="xlarge"
      overflowY="auto"
      {...props}
    />
  )
}
