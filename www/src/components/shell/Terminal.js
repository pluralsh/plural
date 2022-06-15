import './shell.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Drop, Layer, Text } from 'grommet'
import { XTerm } from 'xterm-for-react'
import { FitAddon } from 'xterm-addon-fit'
import { useQuery } from '@apollo/client'
import { CircleInformation } from 'grommet-icons'
import { Update } from 'forge-core'

import { LoopingLogo } from '../utils/AnimatedLogo'
import { socket } from '../../helpers/client'
import { Code } from '../incidents/Markdown'
import { ModalHeader } from '../ModalHeader'

import { ShellStatus } from './ShellStatus'

import { CLOUD_SHELL_QUERY } from './query'
import { ThemeSelector } from './ThemeSelector'
import { normalizedThemes, savedTheme } from './themes'

const decodeBase64 = str => Buffer.from(str, 'base64').toString('utf-8')

export function Shell({ room, header, title, children }) {
  const xterm = useRef(null)
  const [channel, setChannel] = useState(null)
  const [dims, setDims] = useState({})
  const fitAddon = useMemo(() => new FitAddon(), [])
  const theme = savedTheme() || 'chalk'
  const themeStruct = normalizedThemes[theme]

  useEffect(() => {
    if (!xterm || !xterm.current || !xterm.current.terminal) return
    const term = xterm.current.terminal

    fitAddon.fit()
    term.write(`${header}\r\n\r\n`)
    const chan = socket.channel(room, {})
    chan.onError(console.log)
    chan.on('stdo', ({ message }) => term.write(decodeBase64(message)))
    chan.join()

    const { cols, rows } = fitAddon.proposeDimensions()
    chan.push('resize', { width: cols, height: rows })
    setDims({ cols, rows })
    setChannel(chan)
    const ref = socket.onOpen(() => setTimeout(() => chan.push('resize', { width: cols, height: rows }), 1000))

    return () => {
      socket.off([ref])
      chan.leave()
    }
  }, [room, xterm, fitAddon, header])

  const resetSize = useCallback(() => channel.push('resize', { width: dims.cols, height: dims.rows }), [channel, dims])

  return (
    <Box
      fill
      background="background"
    >
      <Box
        flex={false}
        pad="small"
        direction="row"
        align="center"
      >
        <Box
          fill="horizontal"
          direction="row"
          align="center"
          gap="small"
        >
          <Text
            size="small"
            weight={500}
          >{title}
          </Text>
          <Information />
          <Icon
            icon={<Update size="20px" />}
            onClick={resetSize}
            tooltip="repair viewport"
          />
        </Box>
        <ThemeSelector theme={theme} />
      </Box>
      <Box
        fill
        border
        direction="row"
      >
        {children}
        <Box
          fill
          pad="small"
          background={themeStruct.background}
        >
          <XTerm
            className="terminal"
            ref={xterm}
            addons={[fitAddon]}
            options={{ theme: themeStruct }}
            onResize={({ cols, rows }) => {
              if (channel) channel.push('resize', { width: cols, height: rows })
            }}
            onData={text => channel.push('command', { cmd: text })}
          />
        </Box>
      </Box>
    </Box>
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

  if (!data || !data.shell) return <LoopingLogo dark />

  if (!data.shell.alive) return <ShellStatus shell={data.shell} />

  const { shell } = data

  return (
    <Shell
      title={`Cloud Shell [Provider=${shell.provider}, Git=${shell.gitUrl}]`}
      room="shells:me"
      header={`Booting into your ${shell.provider} shell...`}
    >
      <Box
        border={{ side: 'right' }}
        fill="vertical"
        width="300px"
        gap="small"
        pad="small"
      >
        <Text size="small">Here's a few commands to help you get going:</Text>
        <CommandDetails
          command="plural repos list --query <repository-name>"
          description="Searches for repositories to install (omit --query flag to list all)"
        />
        <CommandDetails
          command="plural bundle list APP"
          description="Lists the bundles for an app, eg: plural bundle list airbyte"
        />
        <CommandDetails
          command="plural bundle install APP BUNDLE"
          description="Configures the installation bundle specified"
        />
        <CommandDetails
          command="plural build"
          description="Builds your entire workspace (run after plural bundle install)"
        />
        <CommandDetails
          command='plural deploy --commit "commit message"'
          description="Deploys your current workspace and commits it back to your repository"
        />
        <CommandDetails
          command="plural watch APP"
          description="See the progress of a deployment for a specific app"
        />
      </Box>
    </Shell>
  )
}
