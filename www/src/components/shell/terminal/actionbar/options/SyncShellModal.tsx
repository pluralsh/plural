import { useCallback, useState } from 'react'
import { Codeline, Modal } from '@pluralsh/design-system'
import {
  A,
  Button,
  Flex,
  Span,
} from 'honorable'

function SyncShellModal({ onClose }) {
  const [open, setOpen] = useState(true)
  const close = useCallback(() => {
    setOpen(false)
    onClose()
  }, [onClose])

  return (
    <Modal
      size="large"
      open={open}
      onClose={close}
      style={{ padding: 0 }}
    >
      <Flex
        direction="column"
        gap="large"
      >
        <Span
          body2
          color="text-xlight"
        >SYNC LOCALLY
        </Span>
        <Flex
          direction="column"
          gap="large"
        >
          <Span body1>If you want to work with Plural in your local shell environment, follow the steps below. Note that you must have the&nbsp;
            <A
              inline
              href="https://docs.plural.sh/getting-started/quickstart"
              target="_blank"
            >Plural CLI
            </A>
            &nbsp;installed to do this successfully.
          </Span>
          <Flex
            gap="small"
            direction="column"
          >
            <Span body1>1. Run this command in your local environment.</Span>
            <Codeline background="fill-two">plural shell sync</Codeline>
          </Flex>

          <Flex
            gap="small"
            direction="column"
          >
            <Span body1>2. Run this command in the cloud shell to destroy this cloud shell environment.</Span>
            <Codeline background="fill-two">plural shell purge</Codeline>
          </Flex>
        </Flex>
        <Flex justify="flex-end">
          <Button onClick={close}>Okay</Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

export { SyncShellModal }
