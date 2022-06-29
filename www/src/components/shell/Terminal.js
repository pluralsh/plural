import './shell.css'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Drop, Layer, Text } from 'grommet'
import { XTerm } from 'xterm-for-react'
import { FitAddon } from 'xterm-addon-fit'
import { useQuery } from '@apollo/client'
import { CircleInformation } from 'grommet-icons'
import { Button, Div, Flex, P } from 'honorable'

import { ReloadIcon } from 'pluralsh-design-system'

import { LoopingLogo } from '../utils/AnimatedLogo'
import { socket } from '../../helpers/client'
import { Code } from '../incidents/Markdown'
import { ModalHeader } from '../ModalHeader'

import TerminalThemeContext from '../../contexts/TerminalThemeContext'

import { CLOUD_SHELL_QUERY } from './query'
import TerminalThemeSelector from './TerminalThemeSelector'
import { normalizedThemes } from './themes'
import { ShellStatus } from './onboarding/ShellStatus'
import TerminalThemeProvider from './TerminalThemeProvider'

const { Buffer } = require('buffer/')

const decodeBase64 = str => Buffer.from(str, 'base64').toString('utf-8')

export function Shell({ room, header, title }) {
  const xterm = useRef(null)
  const [channel, setChannel] = useState(null)
  const [dimensions, setDimensions] = useState({})
  const fitAddon = useMemo(() => new FitAddon(), [])
  const [terminalTheme] = useContext(TerminalThemeContext)

  useEffect(() => {
    if (!xterm?.current?.terminal) return

    const term = xterm.current.terminal

    fitAddon.fit()
    term.write(`${header}\r\n\r\n`)

    const chan = socket.channel(room, {})

    chan.onError(console.log)
    chan.on('stdo', ({ message }) => term.write(decodeBase64(message)))
    chan.join()

    const { cols, rows } = fitAddon.proposeDimensions()
    // chan.push('resize', { width: cols, height: rows })
    setDimensions({ cols, rows })
    setChannel(chan)

    const ref = socket.onOpen(() => setTimeout(() => chan.push('resize', { width: cols, height: rows }), 1000))

    return () => {
      socket.off([ref])
      chan.leave()
    }
  }, [room, xterm, fitAddon, header])

  function handleResetSize() {
    channel.push('resize', { width: dimensions.cols, height: dimensions.rows })
  }

  function handleResize({ cols, rows }) {
    if (channel) {
      channel.push('resize', { width: cols, height: rows })
    }
  }

  function handleData(text) {
    channel.push('command', { cmd: text })
  }

  return (
    <>
      <Flex
        align="center"
        paddingVertical="xsmall"
        paddingHorizontal="medium"
        gap="medium"
      >
        <P
          body1
          bold
        >
          {title}
        </P>
        <Div flexGrow={1} />
        <Information />
        <Button
          small
          tertiary
          startIcon={(<ReloadIcon />)}
          onClick={handleResetSize}
        >
          Repair viewport
        </Button>
        <TerminalThemeSelector />
      </Flex>
      <XTerm
        className="terminal"
        ref={xterm}
        addons={[fitAddon]}
        options={{ theme: normalizedThemes[terminalTheme] }}
        onResize={handleResize}
        onData={handleData}
      />
    </>
  )
}

function CommandDetails({ command, description }) {
  return (
    <Box>
      <Text
        size="small"
        weight={500}
      >{command}
      </Text>
      <Text size="small"><i>{description}</i></Text>
    </Box>
  )
}

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

function Information() {
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

export function Terminal() {
  const { data } = useQuery(CLOUD_SHELL_QUERY, { pollInterval: 5000, fetchPolicy: 'cache-and-network' })

  if (!data || !data.shell) {
    return (
      <LoopingLogo />
    )
  }

  if (!data.shell.alive) {
    return (
      <ShellStatus shell={data.shell} />
    )
  }

  const { shell } = data

  return (
    <TerminalThemeProvider>
      <Shell
        title={`Cloud Shell [Provider=${shell.provider}, Git=${shell.gitUrl}]`}
        room="shells:me"
        header={`Booting into your ${shell.provider} shell...`}
      />
    </TerminalThemeProvider>
  )
}
