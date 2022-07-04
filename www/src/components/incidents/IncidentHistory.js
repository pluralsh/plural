import { useMemo, useState } from 'react'
import { Box, Collapsible, Text } from 'grommet'
import moment from 'moment'
import { Down, Next } from 'grommet-icons'
import sortBy from 'lodash.sortby'
import yaml from 'js-yaml'
import ReactDiffViewer from 'react-diff-viewer'

import Avatar from '../users/Avatar'
import { dateFormat } from '../../utils/date'
import { extendConnection } from '../../utils/graphql'

import { Action } from './types'

function historyModifier(action) {
  switch (action) {
    case Action.CREATE:
      return 'created'
    case Action.EDIT:
      return 'updated'
    case Action.ACCEPT:
      return 'accepted'
    case Action.COMPLETE:
      return 'closed'
    case Action.SEVERITY:
      return 'updated severity'
    case Action.STATUS:
      return 'updated status'
    default:
      return ''
  }
}

const yamlDump = val => yaml.safeDump(val || {}, null, 2)

function HistoryChanges({ changes }) {
  const { previous, next } = useMemo(() => {
    const sorted = sortBy(changes, ['key'])
    const prev = yamlDump(sorted.reduce((acc, { key, prev }) => ({ ...acc, [key]: prev }), {}))
    const next = yamlDump(sorted.reduce((acc, { key, next }) => ({ ...acc, [key]: next }), {}))

    return {
      previous: `...\n${prev}\n...`,
      next: `...\n${next}\n...`,
    }
  }, [changes])

  return (
    <Box
      flex={false}
      pad="xsmall"
      style={{ maxWidth: '100%', overflow: 'auto' }}
    >
      <ReactDiffViewer
        oldValue={previous}
        newValue={next}
        splitView={false}
        useDarkTheme
        hideLineNumbers
      />
    </Box>
  )
}

function HistoryItem({ history: { action, actor, insertedAt, changes } }) {
  const [open, setOpen] = useState(false)
  const openable = action !== Action.CREATE

  return (
    <>
      <Box
        flex={false}
        direction="row"
        gap="small"
        align="center"
        margin={{ top: 'xsmall' }}
      >
        <Avatar
          user={actor}
          size="40px"
        />
        <Box>
          <Text
            size="small"
            style={{ whiteSpace: 'nowrap' }}
          >{dateFormat(moment(insertedAt))}
          </Text>
          <Box
            direction="row"
            gap="xsmall"
            align="center"
            pad="xsmall"
            round="xsmall"
            background="light-2"
            style={{ overflow: 'auto' }}
          >
            <Text
              size="small"
              weight={500}
              style={{ whiteSpace: 'nowrap' }}
            >{historyModifier(action)}
            </Text>
          </Box>
        </Box>
        {openable && (
          <Box
            pad="xsmall"
            round="xsmall"
            hoverIndicator="light-2"
            onClick={() => setOpen(!open)}
          >
            {open ? <Down size="15px" /> : <Next size="15px" />}
          </Box>
        )}
      </Box>
      <Collapsible open={open}>
        <HistoryChanges changes={changes} />
      </Collapsible>
    </>
  )
}

export function IncidentHistory({ incident: { history: { edges, pageInfo } }, fetchMore }) {
  return (
    <Box
      flex={false}
      style={{ overflow: 'auto' }}
      fill
      pad={{ horizontal: 'small' }}
    >
      {edges.map(({ node }) => (
        <HistoryItem
          key={node.id}
          history={node}
        />
      ))}
      {pageInfo.hasNextPage && (
        <Box
          margin={{ top: 'xsmall' }}
          round="xsmall"
          pad="xsmall"
          hoverIndicator="light-2"
          onClick={() => fetchMore({
            variables: { historyCursor: pageInfo.endCursor },
            updateQuery: (prev, { fetchMoreResult: { incident: { history } } }) => ({
              ...prev, incident: { ...prev.incident, history: extendConnection(prev.incident.history, history, 'history') },
            }),
          })}
        >
          <Text size="small">load more...</Text>
        </Box>
      )}
    </Box>
  )
}
