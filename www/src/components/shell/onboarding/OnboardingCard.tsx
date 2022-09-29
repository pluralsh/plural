import { Flex, H2 } from 'honorable'

function OnboardingCard({ children, title = '', ...props }) {
  return (
    <Flex
      direction="column"
      body2
      width="100%"
      color="text-light"
      backgroundColor="fill-one"
      border="1px solid border"
      borderRadius="large"
      padding="xlarge"
      paddingTop="medium"
      overflowY="auto"
      {...props}
    >
      {!!title && (
        <H2
          overline
          color="text-xlight"
          marginBottom="xsmall"
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
