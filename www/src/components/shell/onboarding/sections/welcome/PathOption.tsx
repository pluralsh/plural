import OnboardingCardButton, {
  OnBoardCardDescSC,
  OnBoardCardHeaderSC,
  OnboardCardIconSC,
  OnboardCardInnerSC,
} from '../../OnboardingCardButton'

function PathOption({
  icon,
  header,
  description,
  selected,
  disabled,
  ...props
}: any) {
  return (
    <OnboardingCardButton
      position="relative"
      selected={selected}
      disabled={disabled}
      {...props}
    >
      <OnboardCardInnerSC>
        <OnboardCardIconSC $disabled={disabled}>{icon}</OnboardCardIconSC>
        <OnBoardCardHeaderSC $disabled={disabled}>{header}</OnBoardCardHeaderSC>
        <OnBoardCardDescSC $disabled={disabled}>
          {description}
        </OnBoardCardDescSC>
      </OnboardCardInnerSC>
    </OnboardingCardButton>
  )
}

export { PathOption }
