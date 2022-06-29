import './shell.css'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { XTerm } from 'xterm-for-react'
import { FitAddon } from 'xterm-addon-fit'
import { useQuery } from '@apollo/client'
import { Button, Div, Flex, P } from 'honorable'

import { ReloadIcon } from 'pluralsh-design-system'

import { LoopingLogo } from '../utils/AnimatedLogo'
import { socket } from '../../helpers/client'

import TerminalThemeContext from '../../contexts/TerminalThemeContext'

import { CLOUD_SHELL_QUERY } from './query'
import TerminalThemeSelector from './TerminalThemeSelector'
import { normalizedThemes } from './themes'
import { ShellStatus } from './onboarding/ShellStatus'
import TerminalThemeProvider from './TerminalThemeProvider'
import TerminalSidebar from './TerminalSidebar'
import TerminalInformation from './TerminalInformation'

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
        <TerminalInformation />
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
      <Flex gap="xlarge">
        <TerminalSidebar />
        <XTerm
          className="terminal"
          ref={xterm}
          addons={[fitAddon]}
          options={{ theme: normalizedThemes[terminalTheme] }}
          onResize={handleResize}
          onData={handleData}
        />
      </Flex>
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
