import { Div, Flex, Span } from 'honorable'

import OnboardingCardButton from '../../OnboardingCardButton'

function PathOption({
  icon,
  header,
  description,
  selected,
  disabled,
  tooltip,
  ...props
}: any) {
  return (
    <OnboardingCardButton
      position="relative"
      selected={selected}
      disabled={disabled}
      {...props}
    >
      <Flex
        direction="column"
        gap="xxsmall"
      >
        <Div
          marginHorizontal="auto"
          maxWidth={40}
          maxHeight={40}
          overflow="visible"
        >
          {icon}
        </Div>
        <Span
          body1
          bold
          marginTop="small"
        >
          {header}
        </Span>
        <Span
          caption
          color={disabled ? 'text-disabled' : 'text-light'}
        >
          {description}
        </Span>
      </Flex>
    </OnboardingCardButton>
  )
}

export { PathOption }
