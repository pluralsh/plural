import { Div } from 'honorable'

export function ResponsiveLayoutSidecarContainer(props: any) {
  return (
    <Div
      marginLeft="xlarge"
      display-desktop-down="none"
      {...props}
    />
  )
}
