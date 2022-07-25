import { useState } from 'react'
import { CircleInformation } from 'grommet-icons'

import {
  Button, Flex, Modal, Span,
} from 'honorable'
import { Codeline, ModalHeader } from 'pluralsh-design-system'

const CLOUDS = {
  GCP: 'Google Cloud Platform (GCP)',
  AWS: 'Amazon Web Services (AWS)',
  AZURE: 'Microsoft Azure',
}

function Attribute({ name, value }) {
  return (
    <Flex
      gap="2px"
      direction="column"
    >
      <Span color="text-xlight">{name}</Span>
      <Span fontWeight="bold">{value}</Span>
    </Flex>
  )
}

function ShellHint({
  name, hint, code, ...flex
}) {
  return (
    <Flex
      direction="column"
      gap="2px"
      {...flex}
    >
      <Span
        fontWeight="bold"
        color="text-xlight"
      >{name}
      </Span>
      <Codeline>{code}</Codeline>
      <Span color="text-xlight">{hint}</Span>
    </Flex>
  )
}

function TerminalInformation({ shell }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        small
        tertiary
        startIcon={(
          <CircleInformation />
        )}
        onClick={() => setOpen(true)}
      >
        Cloud shell info
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
      >
        <Flex
          width="480px"
          direction="column"
        >
          <ModalHeader onClose={() => setOpen(false)}>
            Cloud shell info
          </ModalHeader>
          <Flex
            direction="column"
            gap="medium"
          >
            <Attribute
              name="Provider"
              value={CLOUDS[shell.provider]}
            />
            <Attribute
              name="Git"
              value={shell.gitUrl}
            />
            <ShellHint
              name="Sync with your local machine"
              code="plural shell sync"
              hint="this will clone your repo locally, and sync all decryption keys"
              marginTop="medium"
            />
            <ShellHint
              name="Delete your cloud shell"
              code="plural shell purge"
              hint="this will delete your shell instance and all credentials and keys attached"
            />
          </Flex>
        </Flex>
      </Modal>
    </>
  )
}

export default TerminalInformation
