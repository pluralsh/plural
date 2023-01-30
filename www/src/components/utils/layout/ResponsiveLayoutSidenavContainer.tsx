import { Div } from 'honorable'

export function ResponsiveLayoutSidenavContainer(props: any) {
  return (
    <Div
      marginRight="xlarge"
      minWidth={0}
      minHeight={0}
      flexShrink={0}
      width={240}
      {...props}
    />
  )
}
