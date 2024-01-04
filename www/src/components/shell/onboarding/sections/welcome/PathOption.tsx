import { Div, Flex, Span } from 'honorable'
import styled from 'styled-components'

import OnboardingCardButton from '../../OnboardingCardButton'

export const OnboardCardInnerSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.xxsmall,
}))
export const OnboardCardIconSC = styled.div<{ $disabled }>(
  ({ theme, $disabled: disabled }) => ({
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 40,
    maxHeight: 40,
    overflow: 'visible',
    ...(disabled ? { filter: 'grayscale(100%)' } : {}),
  })
)
export const OnBoardCardHeaderSC = styled.span<{ $disabled }>(
  ({ theme, $disabled: disabled }) => ({
    ...theme.partials.text.body1Bold,
    marginTop: theme.spacing.small,
    color: disabled ? theme.colors['text-disabled'] : theme.colors['text'],
  })
)
export const OnBoardCardDescSC = styled.span<{ $disabled }>(
  ({ theme, $disabled: disabled }) => ({
    ...theme.partials.text.caption,
    color: disabled
      ? theme.colors['text-disabled']
      : theme.colors['text-light'],
  })
)

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
