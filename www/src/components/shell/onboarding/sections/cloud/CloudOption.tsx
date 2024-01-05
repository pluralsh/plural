import { Tooltip, WrapWithIf } from '@pluralsh/design-system'

import OnboardingCardButton, {
  OnBoardCardDescSC,
  OnBoardCardHeaderSC,
  OnboardCardIconSC,
  OnboardCardInnerSC,
} from '../../OnboardingCardButton'

function CloudOption({
  icon,
  header,
  description,
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
          <OnboardCardIconSC $disabled={disabled}>{icon}</OnboardCardIconSC>
          <OnBoardCardHeaderSC $disabled={disabled}>
            {header}
          </OnBoardCardHeaderSC>
          <OnBoardCardDescSC $disabled={disabled}>
            {description}
          </OnBoardCardDescSC>
        </OnboardCardInnerSC>
      </OnboardingCardButton>
    </WrapWithIf>
  )
}

export { CloudOption }
