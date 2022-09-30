import { Div, Text } from 'honorable'

import OnboardingCardButton from '../../OnboardingCardButton'

function CloudOption({
  providerLogo,
  header,
  description,
  selected,
  ...props
}) {
  return (
    <OnboardingCardButton
      position="relative"
      selected={selected}
      {...props}
    >
      <Div
        marginHorizontal="auto"
        maxWidth={40}
        maxHeight={40}
        overflow="visible"
      >
        {providerLogo}
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
    </OnboardingCardButton>
  )
}

export default CloudOption
