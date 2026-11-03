import { Flex, type FlexProps } from '@pluralsh/design-system'

type ResponsiveLayoutPageProps = Omit<FlexProps, 'padding'> & {
  padding?: FlexProps['padding'] | 0
}

export function ResponsiveLayoutPage({
  children,
  padding = 'large',
  ...props
}: ResponsiveLayoutPageProps) {
  return (
    <Flex
      height="100%"
      width="100%"
      overflowY="hidden"
      padding={padding === 0 ? 'none' : padding}
      grow={1}
      {...props}
    >
      {children}
    </Flex>
  )
}
