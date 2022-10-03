import './terminal.css'

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

import { socket } from '../../../helpers/client'
import TerminalThemeContext from '../../../contexts/TerminalThemeContext'

import useOnboarded from '../useOnboarded'

import TerminalThemeSelector from './TerminalThemeSelector'
import { normalizedThemes } from './themes'
import TerminalSidebar from './TerminalSidebar'
import TerminalInformation from './TerminalInformation'

type DimensionsType = {
  cols: number
  rows: number
}

// eslint-disable-next-line
const { Buffer } = require('buffer/')

const decodeBase64 = str => Buffer.from(str, 'base64').toString('utf-8')

function Shell({ shell }) {
  const xterm = useRef<any>(null)
  const [channel, setChannel] = useState<any>(null)
  const [dimensions, setDimensions] = useState<DimensionsType>({ cols: 80, rows: 24 })
  const [showCheatsheet, setShowCheatsheet] = useState(true)
  const fitAddon = useMemo(() => new FitAddon(), [])
  const [terminalTheme] = useContext(TerminalThemeContext)
  const { fresh } = useOnboarded()

  useEffect(() => {
    if (!xterm?.current?.terminal) return

    const term = xterm.current.terminal
    const chan = socket.channel('shells:me')

    try {
      fitAddon.fit()
    }
    catch (error) {
      console.error(error)
    }

    term.write(`Booting into your ${shell.provider} shell...\r\n\r\n`)
    chan.onError(console.log)
    chan.on('stdo', ({ message }) => term.write(decodeBase64(message)))
    chan.join()

    let cols = 80
    let rows = 24

    try {
      ({ cols, rows } = fitAddon.proposeDimensions())

      setDimensions({ cols, rows })
    }
    catch (error) {
      console.error(error)
    }

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
        {/* <Div><Span fontWeight="bold">{shell.cluster}</Span></Div> */}
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
            // @ts-expect-error
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </Flex>
      </Flex>
    </>
  )
}

export default Shell
