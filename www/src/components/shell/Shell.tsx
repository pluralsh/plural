import './shell.css'
import 'xterm/css/xterm.css'

import { Buffer } from 'buffer'

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Div, Flex } from 'honorable'
import { Button, ReloadIcon, ScrollIcon } from '@pluralsh/design-system'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { useResizeDetector } from 'react-resize-detector'

import TerminalThemeContext from '../../contexts/TerminalThemeContext'
import { socket } from '../../helpers/client'

import TerminalThemeSelector from './TerminalThemeSelector'
import { normalizedThemes } from './themes'
import TerminalSidebar from './TerminalSidebar'
import TerminalInformation from './TerminalInformation'
import useOnboarded from './onboarding/useOnboarded'
import ConfigureMyCloudButton from './ConfigureMyCloudButton'

const decodeBase64 = str => Buffer.from(str, 'base64').toString('utf-8')
const SHELL_CHANNEL_NAME = 'shells:me'

enum ChannelEvent {
  OnData = 'command',
  OnResize = 'resize',
  OnResponse = 'stdo',
}

const resize = (fitAddon: FitAddon, channel: any, terminal: Terminal) => {
  let { cols = 0, rows = 0 } = fitAddon.proposeDimensions() || {}

  cols = Number.isNaN(cols) ? 0 : cols
  rows = Number.isNaN(rows) ? 0 : rows

  terminal.resize(cols, rows)
  if (channel) channel.push(ChannelEvent.OnResize, { width: cols, height: rows })
}

function Shell({ shell }: any) {
  const terminalRef = useRef<HTMLElement>()
  const [terminalTheme] = useContext(TerminalThemeContext)
  const { fresh } = useOnboarded()

  const [channel, setChannel] = useState()
  const [showCheatsheet, setShowCheatsheet] = useState(true)
  const [loaded, setLoaded] = useState(false)

  const terminal = useMemo(() => new Terminal({ cursorBlink: true, theme: normalizedThemes[terminalTheme] }), [terminalTheme])
  const fitAddon = useMemo(() => new FitAddon(), [])

  const onConnectionError = useCallback(err => console.error(`Unknown error during booting into your shell: ${JSON.stringify(err)}`), [])
  const onRepairViewport = useCallback(() => resize(fitAddon, channel, terminal), [channel, fitAddon, terminal])
  const onResize = useCallback(() => resize(fitAddon, channel, terminal), [channel, fitAddon, terminal])

  const { ref: terminalContainerRef } = useResizeDetector({ onResize, refreshMode: 'debounce', refreshRate: 250 })

  // Mount the terminal
  useEffect(() => {
    if (!terminalRef.current) return

    // Load addon
    terminal.loadAddon(fitAddon)

    // Set up the terminal
    terminal.open(terminalRef.current!)

    // Welcome message
    terminal.write(`Booting into your ${shell.provider} shell...\r\n\r\nIt can take a few minutes to load. Try refreshing the page if it gets stuck for too long.\r\n`)

    // Fit the size of terminal element
    fitAddon.fit()

    // Init the connection
    const channel = socket.channel(SHELL_CHANNEL_NAME)

    // Handle input
    terminal.onData(text => channel.push(ChannelEvent.OnData, { cmd: text }))

    channel.onError(onConnectionError)
    channel.on(ChannelEvent.OnResponse, ({ message }) => {
      const decoded = decodeBase64(message)

      if (!loaded && decoded.trim() !== '') {
        setLoaded(true)
      }

      terminal.write(decoded)
    })
    channel.join()

    setChannel(channel)

    return () => channel.leave() || terminal.dispose()
  }, [terminalRef, terminal, fitAddon])

  // Resize after initial response when shell is loaded
  useEffect(() => {
    if (loaded) resize(fitAddon, channel, terminal)
  }, [loaded])

  return (
    <>
      <Flex
        align="center"
        paddingVertical="small"
        marginHorizontal="medium"
        gap="medium"
        borderBottom="1px solid border"
      >
        {!fresh && (
          <Button
            small
            tertiary
            startIcon={(
              <ScrollIcon />
            )}
            onClick={() => setShowCheatsheet(!showCheatsheet)}
          >
            CLI Cheatsheet
          </Button>
        )}
        <Div flexGrow={1} />
        <TerminalInformation shell={shell} />
        <Button
          small
          tertiary
          startIcon={(<ReloadIcon />)}
          onClick={onRepairViewport}
        >
          Repair viewport
        </Button>
        <TerminalThemeSelector />
        <ConfigureMyCloudButton />
      </Flex>
      <Flex
        marginTop="medium"
        flexGrow={1}
        paddingBottom="medium"
        paddingHorizontal="medium"
        height="100%"
        maxHeight="100%"
        overflow="hidden"
      >
        <TerminalSidebar
          shell={shell}
          showCheatsheet={showCheatsheet}
        />
        <Flex
          ref={terminalContainerRef}
          align="center"
          justify="center"
          overflow="hidden"
          borderRadius="large"
          border="1px solid border"
          flexGrow={1}
          paddingTop="medium"
          paddingHorizontal="medium"
          backgroundColor={normalizedThemes[terminalTheme].background}
        >
          <Div
            id="terminal"
            className="terminal"
            ref={terminalRef}
          />
        </Flex>
      </Flex>
    </>
  )
}

export default Shell
