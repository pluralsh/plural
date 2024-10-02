import { FillLevelProvider, StatusOkIcon } from '@pluralsh/design-system'
import { Button, Div } from 'honorable'
import styled from 'styled-components'

function OnboardingCardButton({
  selected = false,
  children,
  showCheckMark = false,
  ...props
}: any) {
  const checkMark = (
    <Div
      position="absolute"
      top={0}
      left={0}
      padding="medium"
    >
      <StatusOkIcon
        size={24}
        color="action-link-inline"
        transform={selected ? 'scale(1)' : 'scale(0)'}
        opacity={selected ? 1 : 0}
        transition="all 0.2s cubic-bezier(.37,1.4,.62,1)"
      />
    </Div>
  )

  return (
    <FillLevelProvider value={2}>
      <Button
        display="flex"
        position="relative"
        flex="1 1 100%"
        paddingLeft="large"
        paddingRight="large"
        paddingTop="large"
        paddingBottom="large"
        alignContent="center"
        justify="center"
        backgroundColor="fill-two"
        border="1px solid border-fill-two"
        borderColor={selected ? 'action-link-inline' : 'border-fill-two'}
        width="100%"
        _hover={{
          backgroundColor: 'fill-two-hover',
          borderColor: selected ? 'action-link-inline' : 'border-fill-two',
        }}
        _active={{ backgroundColor: 'fill-two-selected' }}
        {...props}
      >
        {children}
        {showCheckMark && checkMark}
      </Button>
    </FillLevelProvider>
  )
}

export default OnboardingCardButton

export const OnboardCardInnerSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing.medium,
}))

export const OnboardCardHintSC = styled.div(({ theme }) => ({
  ...theme.partials.text.caption,
  fontStyle: 'italic',
  color: theme.colors['text-light'],
}))

export const OnboardCardIconSC = styled.div<{ $disabled?: boolean }>(
  ({ $disabled: disabled }) => ({
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 40,
    maxHeight: 40,
    overflow: 'visible',
    ...(disabled ? { filter: 'grayscale(100%)' } : {}),
  })
)
export const OnBoardCardHeaderSC = styled.span<{ $disabled?: boolean }>(
  ({ theme, $disabled: disabled }) => ({
    ...theme.partials.text.body1Bold,
    color: disabled ? theme.colors['text-disabled'] : theme.colors.text,
  })
)
export const OnBoardCardDescSC = styled.span<{ $disabled?: boolean }>(
  ({ theme, $disabled: disabled }) => ({
    ...theme.partials.text.caption,
    color: disabled
      ? theme.colors['text-disabled']
      : theme.colors['text-light'],
  })
)
