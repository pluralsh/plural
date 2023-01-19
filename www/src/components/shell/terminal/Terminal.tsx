import './terminal.css'
import 'xterm/css/xterm.css'

import { Buffer } from 'buffer'

import { Button, Div, Flex } from 'honorable'
import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { useResizeDetector } from 'react-resize-detector'
import {
  CliIcon,
  MoreIcon,
  ToolIcon,
  Tooltip,
} from '@pluralsh/design-system'

import { normalizedThemes } from '../theme/themes'
import { socket } from '../../../helpers/client'
import { TerminalThemeSelector } from '../theme/Selector'
import { TerminalThemeContext } from '../theme/context'

interface ActionBarItemProps {
  tooltip?: string,
  icon?: ReactElement,
  children?: ReactElement
}

function ActionBarItem({ tooltip, icon, children }: ActionBarItemProps) {
  const content = icon ? (
    <Button
      width={32}
      height={32}
      small
      secondary
    >{icon}
    </Button>
  ) : children

  return (
    <>
      {tooltip && (
        <Tooltip label={tooltip}>
          <div>{content}</div>
        </Tooltip>
      )}
      {!tooltip && content}
    </>
  )
}

function ActionBar() {
  return (
    <Flex
      height={64}
      gap="small"
      align="center"
      justify="flex-end"
      marginRight="medium"
    >
      <ActionBarItem
        tooltip="Repair Viewport"
        icon={<ToolIcon />}
      />
      <ActionBarItem tooltip="Shell Theme"><TerminalThemeSelector /></ActionBarItem>
      <ActionBarItem
        tooltip="CLI Cheat Sheet"
        icon={<CliIcon />}
      />
      <ActionBarItem icon={<MoreIcon />} />
    </Flex>
  )
}

const decodeBase64 = str => Buffer.from(str, 'base64').toString('utf-8')
const SHELL_CHANNEL_NAME = 'shells:me'

enum ChannelEvent {
  OnData = 'command',
  OnResize = 'resize',
  OnResponse = 'stdo',
}

const resize = (fitAddon: FitAddon, channel: any, terminal: XTerm) => {
  let { cols = 0, rows = 0 } = fitAddon.proposeDimensions() || {}

  cols = Number.isNaN(cols) ? 0 : cols
  rows = Number.isNaN(rows) ? 0 : rows

  terminal.resize(cols, rows)
  if (channel) channel.push(ChannelEvent.OnResize, { width: cols, height: rows })
}

function Terminal({ provider }) {
  const terminalRef = useRef<HTMLElement>()
  const { theme } = useContext(TerminalThemeContext)

  const [channel, setChannel] = useState()
  const [loaded, setLoaded] = useState(false)

  const terminal = useMemo(() => new XTerm({ cursorBlink: true, theme: normalizedThemes[theme] }), [theme])
  const fitAddon = useMemo(() => new FitAddon(), [])

  const onConnectionError = useCallback(err => console.error(`Unknown error during booting into your shell: ${JSON.stringify(err)}`), [])
  const onResize = useCallback(() => resize(fitAddon, channel, terminal), [fitAddon, channel, terminal])

  const { ref: terminalContainerRef } = useResizeDetector({ onResize, refreshMode: 'debounce', refreshRate: 250 })

  // Mount the terminal
  useEffect(() => {
    if (!terminalRef.current) return

    // Load addon
    terminal.loadAddon(fitAddon)

    // Set up the terminal
    terminal.open(terminalRef.current!)

    // Welcome message
    terminal.write(`Booting into your ${provider} shell...\r\n\r\nIt can take a few minutes to load. Try refreshing the page if it gets stuck for too long.\r\n`)

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
    <Flex
      flexGrow={1}
      flexDirection="column"
    >
      <ActionBar />
      <Flex
        ref={terminalContainerRef}
        overflow="hidden"
        flexGrow={1}
        backgroundColor={normalizedThemes[theme].background}
        padding="large"
      >
        <Div
          id="terminal"
          className="terminal"
          ref={terminalRef}
        />
      </Flex>
    </Flex>
  )
}

export default Terminal
