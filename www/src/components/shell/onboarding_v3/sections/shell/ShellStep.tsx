import { Button } from '@pluralsh/design-system'
import { Flex, Span } from 'honorable'

function ShellStep({ onBack, onNext }) {
  return (
    <Flex
      direction="column"
      gap="medium"
    >
      <Span>Shell Step</Span>
      <Flex
        gap="medium"
        justify="space-between"
      >
        <Button
          secondary
          onClick={onBack}
        >Back
        </Button>
      </Flex>
    </Flex>
  )
}

export default ShellStep
