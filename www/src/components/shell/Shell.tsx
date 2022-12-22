import './shell.css'

import { Buffer } from 'buffer'

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
import { Button, ReloadIcon, ScrollIcon } from '@pluralsh/design-system'
import { useResizeDetector } from 'react-resize-detector'
import debounce from 'lodash/debounce'

import { socket } from '../../helpers/client'
import TerminalThemeContext from '../../contexts/TerminalThemeContext'

import TerminalThemeSelector from './TerminalThemeSelector'
import { normalizedThemes } from './themes'
import TerminalSidebar from './TerminalSidebar'
import TerminalInformation from './TerminalInformation'
import useOnboarded from './onboarding/useOnboarded'
import ConfigureMyCloudButton from './ConfigureMyCloudButton'

const decodeBase64 = str => Buffer.from(str, 'base64').toString('utf-8')
// const detachedMessage = '[detached (from session workspace)]'

function Shell({ shell }: any) {
  const xterm = useRef<any>(null)
  const [channel, setChannel] = useState<any>(null)
  const [dimensions, setDimensions] = useState<any>({})
  const [showCheatsheet, setShowCheatsheet] = useState(true)
  const fitAddon = useMemo(() => new FitAddon(), [])
  const [terminalTheme] = useContext(TerminalThemeContext)
  const { fresh } = useOnboarded()
  const [open, setOpen] = useState(false)
  const [fitted, setFitted] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!xterm?.current?.terminal) {
      return
    }

    const term = xterm.current.terminal

    term.options = {} // hack around an xterm-addon-fit bug
    const chan = socket.channel('shells:me')

    term.write(`Booting into your ${shell.provider} shell...\r\n\r\nIt can take a few minutes to load. Try refreshing the page if it gets stuck for too long.\r\n`)
    chan.onError(err => console.error(`Unknown error during booting into your shell: ${JSON.stringify(err)}`))
    chan.on('stdo', ({ message }) => {
      const decoded = decodeBase64(message)

      if (!open && decoded.trim() !== '') {
        setOpen(true)
      }

      term.write(decoded)
    })
    chan.join()
    setChannel(chan)

    return () => {
      chan.leave()
    }
  }, [shell, xterm, setOpen, open])

  const handleResize = useCallback(({ cols, rows }) => {
    if (!channel) return
    channel.push('resize', { width: cols, height: rows })
  }, [channel])

  useEffect(() => {
    if (fitted || !xterm?.current?.terminal || !channel) return

    try {
      fitAddon.fit()
      const { cols, rows } = fitAddon.proposeDimensions() as any

      handleResize({ cols, rows })
      setDimensions({ cols, rows })
      setFitted(true)
    }
    catch (error) {
      console.error(error)
      console.log(`retrying fitting window, retries ${retry}`)
      setTimeout(() => setRetry(retry + 1), 1000)
    }
  }, [xterm, fitAddon, setFitted, fitted, channel, handleResize, retry, setRetry, setDimensions])

  const handleResetSize = useCallback(() => {
    if (!channel) return
    channel.push('resize', { width: dimensions.cols, height: dimensions.rows })
  }, [channel, dimensions])

  useEffect(() => {
    handleResetSize()
  }, [handleResetSize, dimensions, open])

  const { ref } = useResizeDetector({
    onResize: debounce(() => {
      if (!channel) return
      fitAddon.fit()
      handleResize(fitAddon.proposeDimensions() as any as any)
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
