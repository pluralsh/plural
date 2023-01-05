import { Flex, H2 } from 'honorable'

function OnboardingCard({ children, title = '', ...props }: any) {
  return (
    <Flex
      direction="column"
      body2
      width="100%"
      color="text-light"
      backgroundColor="fill-one"
      border="1px solid border"
      borderRadius="large"
      paddingVertical="xlarge"
      paddingHorizontal="112px"
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
