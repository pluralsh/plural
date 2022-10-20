import { Div, Flex, Hr } from 'honorable'

export default function OnboardingNavSection({ children, ...props }: any) {
  return (
    <Div
      marginTop="large"
      {...props}
    >
      <Hr />
      <Flex
        justify="space-between"
        marginTop="large"
      >
        {children}
      </Flex>
    </Div>
  )
}
