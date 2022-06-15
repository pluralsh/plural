import { StatusIpIcon } from 'pluralsh-design-system'
import { Button, Div } from 'honorable'

function OnboardingCardButton({ selected = false, children, ...props }) {
  const checkMark = (
    <Div
      position="absolute"
      top={0}
      left={0}
      padding="medium"
    >
      <StatusIpIcon
        size={24}
        color="action-link-inline"
        transform={selected ? 'scale(1)' : 'scale(0)'}
        opacity={selected ? 1 : 0}
        transition="all 0.2s cubic-bezier(.37,1.4,.62,1)"
      />
    </Div>
  )

  return (
    <Button
      display="flex"
      position="relative"
      flex="1 1 100%"
      padding="large"
      marginHorizontal="medium"
      alignContent="center"
      justify="center"
      backgroundColor="fill-two"
      border="1px solid border-fill-two"
      borderColor={selected ? 'action-link-inline' : 'border-fill-two'}
      _hover={{ backgroundColor: 'fill-two-hover' }}
      _active={{ backgroundColor: 'fill-two-selected' }}
      {...props}
    >
      {children}
      {checkMark}
    </Button>
  )
}

export default OnboardingCardButton
