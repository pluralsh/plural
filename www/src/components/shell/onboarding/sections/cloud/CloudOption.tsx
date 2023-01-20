import {
  Div,
  Flex,
  Span,
  Text,
} from 'honorable'

import OnboardingCardButton from '../../OnboardingCardButton'

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
          color="text-light"
        >
          {description}
        </Span>
      </Flex>
    </OnboardingCardButton>
  )
}

export { CloudOption }
