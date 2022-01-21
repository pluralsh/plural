import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Text } from 'grommet'
import { socket } from '../../helpers/client'
import { XTerm } from 'xterm-for-react'
import { FitAddon } from 'xterm-addon-fit'
import './shell.css'
import { normalizedThemes, savedTheme } from './themes'
import { ThemeSelector } from './ThemeSelector'
import { CLOUD_SHELL } from './query'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { useQuery } from 'react-apollo'
import { ShellStatus } from './ShellStatus'

export function Shell({room, header, children: [title, sidebar]}) {
  const xterm = useRef(null)
  const [channel, setChannel] = useState(null)
  const fitAddon = useMemo(() => new FitAddon(), [])
  const theme = savedTheme() || 'chalk'
  const themeStruct = normalizedThemes[theme]

  useEffect(() => {
    if (!xterm || !xterm.current || !xterm.current.terminal) return
    const term = xterm.current.terminal
  
    fitAddon.fit()
    term.write(header + "\r\n\r\n")
    const chan = socket.channel(room, {})
    chan.onError(console.log)
    chan.on("stdo", ({message}) => term.write(message))
    chan.join()
    
    const {cols, rows} = fitAddon.proposeDimensions()
    chan.push('resize', {width: cols, height: rows})
    setChannel(chan)
    return () => chan.leave()
  }, [room, xterm, fitAddon])

  return (
    <Box fill background='backgroundColor'>
      <Box flex={false} pad='small' direction='row' align='center'>
        {title}
        <ThemeSelector theme={theme} />
      </Box>
      <Box fill border direction='row'>
        {sidebar}
        <Box fill pad='small' background={themeStruct.background}>
          <XTerm 
            className='terminal'
            ref={xterm}
            addons={[fitAddon]}
            options={{theme: themeStruct}}
            onResize={({cols, rows}) => {
              channel && channel.push('resize', {width: cols, height: rows})
            }}
            onData={(text) => channel.push("command", {cmd: text})} />
        </Box>
      </Box>
    </Box>
  )
}

function CommandDetails({command, description}) {
  return (
    <Box>
      <Text size='small' weight={500}>{command}</Text>
      <Text size='small'><i>{description}</i></Text>
    </Box>
  )
}

export function Terminal() {
  const {data, loading} = useQuery(CLOUD_SHELL, {pollInterval: 5000})

  if (loading || !data || !data.shell) return <LoopingLogo dark /> 

  if (!data.shell.alive) return <ShellStatus shell={data.shell} />

  const {shell} = data
  return (
    <Shell room='shells:me' header={`Booting into your ${shell.provider} shell...`}>
      <Box fill='horizontal' justify='center'>
        <Text size='small' weight={500}>Cloud Shell [Provider={shell.provider}, Git={shell.gitUrl}]</Text>
      </Box>
      <Box border={{side: 'right'}} fill='vertical' width='300px' gap='small' pad='small'>
        <Text size='small'>Here's a few commands to help you get going:</Text>
        <CommandDetails
          command='plural bundle list APP'
          description='Lists the bundles for an app, eg: plural bundle list airbyte' />
        <CommandDetails
          command='plural bundle install APP BUNDLE'
          description='Configures the installation bundle specified' />
        <CommandDetails
          command='plural build'
          description='Builds your entire workspace (run after plural bundle install)' />
        <CommandDetails
          command='plural deploy --commit "commit message"'
          description='Deploys your current workspace and commits it back to your repository' />
        <CommandDetails
          command='plural watch APP'
          description='See the progress of a deployment for a specific app' />
      </Box>
    </Shell>
  )
}