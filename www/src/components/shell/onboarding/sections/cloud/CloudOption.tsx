import { Flex, Tooltip, WrapWithIf } from '@pluralsh/design-system'

import OnboardingCardButton, {
  OnBoardCardDescSC,
  OnBoardCardHeaderSC,
  OnboardCardHintSC,
  OnboardCardIconSC,
  OnboardCardInnerSC,
} from '../../OnboardingCardButton'

function CloudOption({
  icon,
  header,
  description,
  hint,
  chip,
  selected,
  disabled,
  tooltip,
  ...props
}: any) {
  return (
    <WrapWithIf
      condition={!!tooltip}
      wrapper={
        <Tooltip
          label={tooltip}
          placement="top"
        />
      }
    >
      <OnboardingCardButton
        position="relative"
        selected={selected}
        disabled={disabled}
        {...props}
      >
        <OnboardCardInnerSC>
          {hint && <OnboardCardHintSC>{hint}</OnboardCardHintSC>}
          <OnboardCardIconSC $disabled={disabled}>{icon}</OnboardCardIconSC>
          <Flex
            direction="column"
            gap="xxsmall"
          >
            <OnBoardCardHeaderSC $disabled={disabled}>
              {header}
            </OnBoardCardHeaderSC>
            <OnBoardCardDescSC $disabled={disabled}>
              {description}
            </OnBoardCardDescSC>
          </Flex>
          {chip}
        </OnboardCardInnerSC>
      </OnboardingCardButton>
    </WrapWithIf>
  )
}

export { CloudOption }
