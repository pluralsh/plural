import { useState } from 'react'
import { Codeline, Divider, InfoIcon } from '@pluralsh/design-system'

import {
  Button,
  Flex,
  Modal,
  Span,
} from 'honorable'

const CLOUDS = {
  GCP: 'Google Cloud Platform (GCP)',
  AWS: 'Amazon Web Services (AWS)',
  AZURE: 'Microsoft Azure',
}

function Attribute({ name, value }: any) {
  return (
    <Flex
      gap="2px"
      direction="column"
      body1
    >
      <Span color="text-xlight">{name}</Span>
      <Span fontWeight="600">{value}</Span>
    </Flex>
  )
}

function ShellHint({
  name, hint, code, ...flex
}: any) {
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

function TerminalInformation({ shell }: any) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        small
        tertiary
        startIcon={<InfoIcon size={16} />}
        onClick={() => setOpen(true)}
      >
        Cloud shell info
      </Button>
      <Modal
        header="Cloud shell info"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Flex direction="column">
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
            <Divider
              backgroundColor="border"
              marginTop="small"
            />
            <ShellHint
              name="Sync with your local machine"
              code="plural shell sync"
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
