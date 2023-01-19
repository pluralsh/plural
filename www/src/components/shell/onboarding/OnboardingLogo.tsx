import { Div, Flex, Img } from 'honorable'

// TODO: Export to the Design System

// @ts-ignore
import OnboardingTitleOnboardingSVG from './assets/OnboardingTitleOnboarding.svg'

export function OnboardingLogo() {
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
    </Div>
  )
}
