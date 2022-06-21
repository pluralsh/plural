import { Div, H2 } from 'honorable'

function OnboardingCard({ children, title = '', ...props }) {
  return (
    <Div
      width="100%"
      backgroundColor="fill-one"
      border="1px solid border"
      borderRadius="large"
      padding="xlarge"
      paddingTop="medium"
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
    </Div>
  )
}

export default OnboardingCard
