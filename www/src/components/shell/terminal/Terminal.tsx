import './terminal.css'
import 'xterm/css/xterm.css'

import { Buffer } from 'buffer'

import { Div, Flex } from 'honorable'
import {
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

import { Modal } from '@pluralsh/design-system'

import { useAuthToken } from '../../../contexts/AuthTokenContext'
import { socket } from '../../../helpers/client'

import { normalizedThemes } from './actionbar/theme/themes'
import { TerminalThemeContext } from './actionbar/theme/context'
import { State, TerminalContext } from './context/terminal'
import { ActionBar } from './actionbar/ActionBar'

const decodeBase64 = (str) => Buffer.from(str, 'base64').toString('utf-8')
const SHELL_CHANNEL_NAME = 'shells:me'

enum ChannelEvent {
  OnData = 'command',
  OnResize = 'resize',
  OnResponse = 'stdo',
  Reply = 'phx_reply',
}

const resize = (fitAddon: FitAddon, channel: any, terminal: XTerm) => {
  let { cols = 0, rows = 0 } = fitAddon.proposeDimensions() || {}

  cols = Number.isNaN(cols) ? 0 : cols
  rows = Number.isNaN(rows) ? 0 : rows

  terminal.resize(cols, rows)
  if (channel)
    channel.push(ChannelEvent.OnResize, { width: cols, height: rows })
}

function Terminal({ provider }) {
  const terminalRef = useRef<HTMLElement>()
  const { theme } = useContext(TerminalThemeContext)
  const terminalCtx = useContext(TerminalContext)
  const { state, setState, setOnAction } = terminalCtx
  const authToken = useAuthToken()
  const [socketError, setSocketError] = useState(null)
  const [closeModal, setCloseModal] = useState(false)

  useEffect(() => {
    let skipCallback = false
    const callback = () => {
      if (!skipCallback) {
        socket.connect(
          authToken ? { Authorization: `Bearer ${authToken}` } : {}
        )
      }
    }

    socket.disconnect(callback)

    return () => {
      skipCallback = true
    }
  }, [authToken])

  const [channel, setChannel] = useState<any>()
  const [loaded, setLoaded] = useState(false)

  const terminal = useMemo(
    () => new XTerm({ cursorBlink: true, theme: normalizedThemes[theme] }),
    [theme]
  )
  const fitAddon = useMemo(() => new FitAddon(), [])

  const onConnectionError = useCallback(
    (err) =>
      console.error(
        `Unknown error during booting into your shell: ${JSON.stringify(err)}`
      ),
    []
  )
  const onResize = useCallback(
    () => resize(fitAddon, channel, terminal),
    [fitAddon, channel, terminal]
  )
  const onAction = useCallback(
    () => (cmd) => channel?.push(ChannelEvent.OnData, { cmd: `${cmd}\r` }),
    [channel]
  )

  const { ref: terminalContainerRef } = useResizeDetector({
    onResize,
    refreshMode: 'debounce',
    refreshRate: 250,
  })

  // Mount the terminal
  useEffect(() => {
    if (!terminalRef.current) return

    // Load addon
    terminal.loadAddon(fitAddon)

    // Set up the terminal
    terminal.open(terminalRef.current!)

    // Welcome message
    terminal.write(
      `Booting into your ${provider} shell...\r\n\r\nIt can take a few minutes to load. Try refreshing the page if it gets stuck for too long.\r\n`
    )

    // Fit the size of terminal element
    fitAddon.fit()

    // Init the connection
    const channel = socket.channel(SHELL_CHANNEL_NAME)

    // Handle input
    terminal.onData((text) => channel.push(ChannelEvent.OnData, { cmd: text }))

    channel.onError(onConnectionError)
    channel.on(ChannelEvent.Reply, ({ response, status }) => {
      if (status === 'error' && response?.reason) {
        setSocketError(response?.reason)
      }
    })
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminalRef, terminal, fitAddon])

  // Resize after initial response when shell is loaded
  useEffect(() => {
    if (loaded) resize(fitAddon, channel, terminal)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  useEffect(() => {
    if (state === State.Installed && channel) {
      const cmd =
        'plural build && plural deploy --commit "deploying a few apps with plural"\r'

      channel.push(ChannelEvent.OnData, { cmd })
      setState(State.New)
    }
  }, [state, setState, terminal, channel])

  useEffect(() => setOnAction(onAction), [onAction, setOnAction])

  return (
    <Flex
      flexGrow={1}
      flexDirection="column"
    >
      <Modal
        open={!!socketError && !closeModal}
        onClose={() => setCloseModal(true)}
        header="Could not bind to cloud shell"
        severity="danger"
      >
        {socketError}
      </Modal>
      <ActionBar onRepairViewport={onResize} />
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
