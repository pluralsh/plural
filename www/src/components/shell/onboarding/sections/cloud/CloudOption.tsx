import { Div, Flex, Span } from 'honorable'
import { Tooltip, WrapWithIf } from '@pluralsh/design-system'

import OnboardingCardButton from '../../OnboardingCardButton'

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
      wrapper={(
        <Tooltip
          label={tooltip}
          placement="top"
        />
      )}
    >
      <div>
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
      </div>
    </WrapWithIf>
  )
}

export { CloudOption }
