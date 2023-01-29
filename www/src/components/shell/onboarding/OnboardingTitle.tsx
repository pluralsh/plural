import {
  Div,
  Flex,
  Hr,
  Img,
} from 'honorable'
import { useTheme } from 'styled-components'

// @ts-ignore
import OnboardingTitleOnboardingSVG from './OnboardingTitleOnboarding.svg'

function OnboardingHeader() {
  const theme = useTheme()

  return (
    <Div width="100%">
      <Flex align="flex-end">
        <Img
          src="/logos/plural-logomark-only-white.svg"
          height={22}
          marginRight="xsmall"
          marginBottom={2}
        />
        <Img
          src="/logos/plural-logotype-only-white.svg"
          height={26}
          marginRight="small"
        />
        <img
          src={OnboardingTitleOnboardingSVG}
          alt="Plural onboarding"
        />
      </Flex>
      <Hr
        marginTop={theme.spacing.large}
        marginBottom="medium"
      />
    </Div>
  )
}

export default OnboardingHeader
