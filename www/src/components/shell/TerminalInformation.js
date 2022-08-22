import { useState } from 'react'
import { CircleInformation } from 'grommet-icons'

import {
  Button, Flex, Modal, Span,
} from 'honorable'
import { Codeline, Divider, ModalHeader } from 'pluralsh-design-system'

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
      marginBottom="xxsmall"
      {...flex}
    >
      <Span
        fontWeight="bold"
        color="text-light"
        marginBottom="xxsmall"
      >{name}
      </Span>
      <Codeline>{code}</Codeline>
      <Span
        caption
        color="text-xlight"
        marginTop="xxsmall"
      >
        {hint}
      </Span>
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
        <Flex direction="column">
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
              code="plural login && plural shell sync"
              hint="This will clone your repo locally and sync all encryption keys needed to access it."
              marginTop="medium"
            />
            <ShellHint
              name="Delete your cloud shell"
              code="plural shell purge"
              hint="If there's anything important you deployed, be sure to sync your shell locally before purging."
            />
          </Flex>
        </Flex>
      </Modal>
    </>
  )
}

export default TerminalInformation
