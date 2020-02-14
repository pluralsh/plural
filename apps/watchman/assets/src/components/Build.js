import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-apollo'
import { Box, Text } from 'grommet'
import { LazyLog } from 'react-lazylog'
import { BUILD_Q, BUILD_SUB } from './graphql/builds'
import Loading from './utils/Loading'
import ScrollableContainer from './utils/ScrollableContainer'
import { mergeList } from './graphql/utils'
import moment from 'moment'

function Timer({insertedAt, completedAt}) {
  const end = completedAt ? moment(completedAt) : moment()
  const begin = moment(insertedAt)
  const [duration, setDuration] = useState(end.diff(begin))
  useEffect(() => {
    if (completedAt) {
      setDuration(moment(completedAt).diff(begin))
      return
    }

    const interval = setInterval(() => setDuration(moment().diff(begin)), 1000)
    return () => clearInterval(interval)
  }, [insertedAt, completedAt])

  return <Text size='small'>{duration.format('HH:mm:SS')}</Text>
}

function BuildTimer({insertedAt, completedAt, status}) {
  const background = status === "SUCCESSFUL" ? 'status-ok' : (status === 'FAILED' ? 'status-error' : 'running')
  return (
    <Box pad='small' background={background}>
      <Timer insertedAt={insertedAt} completedAt={completedAt} />
    </Box>
  )
}

function Command({command}) {
  return (
    <Box fill='horizontal' border='bottom'>
      <Box direction='row' gap='small'>
        <pre>~> {command}</pre>
      </Box>
      {command.stdout && <LazyLog text={command.stdout} />}
    </Box>
  )
}

function updateQuery(prev, {subscriptionData: {data}}) {
  if (!data) return prev
  const {commandDelta: {delta, payload}} = data

  return {...prev, build: {...prev.build, commands: mergeList(prev.build.commands, delta, payload)}}
}

export default function Build() {
  const {buildId} = useParams()
  const {data, loading, subscribeToMore} = useQuery(BUILD_Q, {variables: {buildId}})
  useEffect(() => subscribeToMore({document: BUILD_SUB, updateQuery}), [])

  if (!data || loading) return <Loading />
  const {commands, ...build} = data.build

  return (
    <Box height='100vh' pad={{bottom: 'small'}}>
      <ScrollableContainer>
        <Box gap='small' pad={{horizontal: 'medium'}}>
          <Box direction='row'>
            <Box>
              <Text size='small' weight='bold'>{build.repository}</Text>
            </Box>
            <BuildTimer insertedAt={build.insertedAt} completedAt={build.completedAt} />
          </Box>
          <Box>
            {commands.map((command) => <Command command={command} />)}
          </Box>
        </Box>
      </ScrollableContainer>
    </Box>
  )
}