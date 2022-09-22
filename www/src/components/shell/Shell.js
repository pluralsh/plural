import './shell.css'

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { XTerm } from 'xterm-for-react'
import { FitAddon } from 'xterm-addon-fit'
import { Div, Flex } from 'honorable'
import { Button, ReloadIcon, ScrollIcon } from 'pluralsh-design-system'
import { useResizeDetector } from 'react-resize-detector'
import debounce from 'lodash/debounce'

import { socket } from '../../helpers/client'
import TerminalThemeContext from '../../contexts/TerminalThemeContext'

import TerminalThemeSelector from './TerminalThemeSelector'
import { normalizedThemes } from './themes'
import TerminalSidebar from './TerminalSidebar'
import TerminalInformation from './TerminalInformation'
import { useOnboarded } from './onboarding/useOnboarded'

const decodeBase64 = str => Buffer.from(str, 'base64').toString('utf-8')

export function Shell({ shell }) {
  const xterm = useRef(null)
  const [channel, setChannel] = useState(null)
  const [dimensions, setDimensions] = useState({})
  const [showCheatsheet, setShowCheatsheet] = useState(true)
  const fitAddon = useMemo(() => new FitAddon(), [])
  const [terminalTheme] = useContext(TerminalThemeContext)
  const { fresh } = useOnboarded()

  useEffect(() => {
    if (!xterm?.current?.terminal) return

    const term = xterm.current.terminal
    const chan = socket.channel('shells:me')

    fitAddon.fit()
    term.write(`Booting into your ${shell.provider} shell...\r\n\r\n`)
    chan.onError(console.log)
    chan.on('stdo', ({ message }) => term.write(decodeBase64(message)))
    chan.join()

    const { cols, rows } = fitAddon.proposeDimensions() || { cols: 80, rows: 24 }

    setDimensions({ cols, rows })
    setChannel(chan)

    const ref = socket.onOpen(() => setTimeout(() => chan.push('resize', { width: cols, height: rows }), 1000))

    return () => {
      socket.off([ref])
      chan.leave()
    }
  }, [shell, xterm, fitAddon])

  const handleResetSize = useCallback(() => {
    if (!channel) return
    channel.push('resize', { width: dimensions.cols, height: dimensions.rows })
  }, [channel, dimensions])

  useEffect(() => {
    handleResetSize()
  }, [handleResetSize])

  const handleResize = useCallback(({ cols, rows }) => {
    if (!channel) return
    channel.push('resize', { width: cols, height: rows })
  }, [channel])

  const { ref } = useResizeDetector({
    onResize: debounce(() => {
      if (!channel) return
      fitAddon.fit()
      handleResize(fitAddon.proposeDimensions())
    }, 500, { leading: true }),
  })

  const handleData = useCallback(text => channel.push('command', { cmd: text }), [channel])

  return (
    <Flex
      direction="column"
      flexGrow={1}
      align="center"
      paddingHorizontal="large"
      paddingVertical="medium"
    >
      <Flex
        align="center"
        paddingBottom="small"
        gap="medium"
        borderBottom="1px solid border"
        width="100%"
        maxWidth={1640}
      >
        {!fresh && (
          <Button
            small
            tertiary
            startIcon={<ScrollIcon />}
            onClick={() => setShowCheatsheet(!showCheatsheet)}
            backgroundColor={showCheatsheet ? 'fill-zero-selected' : 'fill-zero'}
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
          onClick={handleResetSize}
        >
          Repair viewport
        </Button>
        <TerminalThemeSelector />
      </Flex>
      <Flex
        marginTop="medium"
        height="100%"
        maxHeight="100%"
        width="100%"
        maxWidth={1640}
        overflow="hidden"
      >
        <TerminalSidebar
          shell={shell}
          showCheatsheet={showCheatsheet}
        />
        <Flex
          ref={ref}
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
          <XTerm
            className="terminal"
            ref={xterm}
            addons={[fitAddon]}
            options={{ theme: normalizedThemes[terminalTheme] }}
            onResize={handleResize}
            onData={handleData}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}
export default Shell
