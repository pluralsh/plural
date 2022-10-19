import { Button, Flex } from 'honorable'
import { Dispatch } from 'react'

export function ChecklistFooter({ setDismiss }: {setDismiss: Dispatch<boolean>}) {
  return (
    <Flex
      gap="small"
    >
      <Button
        as="a"
        href="https://discord.gg/pluralsh"
        target="_blank"
        rel="noopener noreferrer"
        secondary
        small
      >Support
      </Button>

      <Button
        as="a"
        href="https://docs.plural.sh/"
        target="_blank"
        rel="noopener noreferrer"
        secondary
        small
      >Docs
      </Button>

      <Button
        as="a"
        href="https://github.com/pluralsh/plural"
        target="_blank"
        rel="noopener noreferrer"
        secondary
        small
      >GitHub
      </Button>

      <Flex flex="1" />

      <Button
        small
        tertiary
        padding="none"
        onClick={() => setDismiss(true)}
      >Dismiss
      </Button>
    </Flex>
  )
}
