import { useCallback, useRef, useState } from 'react'
import { Box, Drop, Layer, Text } from 'grommet'
import { CircleInformation } from 'grommet-icons'

import { Code } from '../incidents/Markdown'
import { ModalHeader } from '../ModalHeader'

function Icon({ icon, onClick, tooltip }) {
  const ref = useRef()
  const [hover, setHover] = useState(false)

  return (
    <>
      <Box
        ref={ref}
        pad="xsmall"
        align="center"
        justify="center"
        onClick={onClick}
        hoverIndicator="card"
        round="xsmall"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {icon}
      </Box>
      {tooltip && hover && ref.current && (
        <Drop
          plain
          target={ref.current}
          align={{ left: 'right' }}
          margin={{ left: 'xsmall' }}
        >
          <Box
            round="3px"
            background="sidebarHover"
            pad="xsmall"
            elevation="small"
            align="center"
            justify="center"
          >
            <Text
              size="small"
              weight={500}
            >{tooltip}
            </Text>
          </Box>
        </Drop>
      )}
    </>
  )
}

function TerminalInformation() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [setOpen])

  return (
    <>
      <Icon
        icon={<CircleInformation size="20px" />}
        onClick={() => setOpen(true)}
      />
      {open && (
        <Layer
          modal
          onEsc={close}
          onClickOutside={close}
        >
          <Box width="50vw">
            <ModalHeader
              text="Cloud Shell Info"
              setOpen={setOpen}
            />
            <Box
              pad="small"
              gap="medium"
              border="between"
            >
              <Box gap="xsmall">
                <Code
                  className="lang-bash"
                  header="To sync your cloud shell with your local machine, simply run:"
                >
                  plural login && plural shell sync
                </Code>
                <Text size="small"><i>this will clone your repository locally, and sync all encryption keys needed to access it</i></Text>
              </Box>
              <Box gap="small">
                <Code
                  className="lang-bash"
                  header="To delete your shell entirely, run:"
                >
                  plural shell purge
                </Code>
                <Text size="small"><i>If there's anything important you deployed, <b>be sure to sync your shell locally before purging</b></i></Text>
              </Box>
            </Box>
          </Box>
        </Layer>
      )}
    </>
  )
}

export default TerminalInformation
