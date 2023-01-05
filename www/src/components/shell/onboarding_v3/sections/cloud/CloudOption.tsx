import { Div, Flex, Text } from 'honorable'

import OnboardingCardButton from '../../../onboarding/OnboardingCardButton'

function CloudOption({
  icon,
  header,
  description,
  selected,
  ...props
}: any) {
  return (
    <OnboardingCardButton
      position="relative"
      selected={selected}
      {...props}
    >
      <Flex display="column">
        <Div
          marginHorizontal="auto"
          maxWidth={40}
          maxHeight={40}
          overflow="visible"
        >
          {icon}
        </Div>
        <Text
          body1
          bold
          marginTop="medium"
        >
          {header}
        </Text>
        <Text
          caption
          color="text-light"
        >
          {description}
        </Text>
      </Flex>
    </OnboardingCardButton>
  )
}

export { CloudOption }
