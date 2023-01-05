import { Button } from '@pluralsh/design-system'
import { Flex, Span } from 'honorable'

function WorkspaceStep({ onBack, onNext }) {
  return (
    <Flex
      direction="column"
      gap="medium"
    >
      <Span>Workspace Step</Span>
      <Flex
        gap="medium"
        justify="space-between"
      >
        <Button
          secondary
          onClick={onBack}
        >Back
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </Flex>
    </Flex>
  )
}

export default WorkspaceStep
