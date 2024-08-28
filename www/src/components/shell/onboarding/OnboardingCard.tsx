import { Flex, H2 } from 'honorable'

interface OnboardingCardProps {
  title?: string
  mode?: 'Compact' | 'Default'
  children: JSX.Element | Array<JSX.Element> | unknown
}

function OnboardingCard({
  title = '',
  mode = 'Default',
  children,
  ...props
}: OnboardingCardProps) {
  return (
    <Flex
      direction="column"
      body2
      width="100%"
      color="text-light"
      backgroundColor="fill-one"
      border="1px solid border"
      borderRadius="large"
      paddingVertical={mode === 'Default' ? 'xlarge' : 'medium'}
      paddingHorizontal={mode === 'Default' ? 64 : 0}
      overflowY="auto"
      {...props}
    >
      {!!title && (
        <H2
          overline
          color="text-xlight"
          marginBottom="xlarge"
          width="100%"
        >
          {title}
        </H2>
      )}
      {children}
    </Flex>
  )
}

export default OnboardingCard
