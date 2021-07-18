import React, { useCallback, useState } from 'react'
import { Box, Collapsible, Text, Layer } from 'grommet'
import { Trash } from 'grommet-icons'
import { useMutation, useQuery } from 'react-apollo'
import { CREATE_TOKEN, TOKENS_Q, DELETE_TOKEN, TOKEN_AUDITS } from './queries'
import { Button, Scroller, Copyable, HoveredBackground, BORDER_COLOR, ModalHeader } from 'forge-core'
import moment from 'moment'
import { deepUpdate, extendConnection, removeConnection, updateCache } from '../../utils/graphql'
import { StandardScroller } from '../utils/SmoothScroller'
import { HeaderItem } from '../repos/Docker'
import { SectionPortal } from '../Explore'
import { Placeholder } from '../accounts/Audits'
import { Icon } from '../accounts/Group'
import { Confirm } from '../utils/Confirm'

const CELL_WIDTH='200px'

function AuditHeader() {
  return (
    <Box flex={false} direction='row' pad='small' gap='xsmall' border={{side: 'bottom', color: 'light-5'}} align='center'>
      <HeaderItem text='IP' width='33%' />
      <HeaderItem text='Timestamp' width='33%' />
      <HeaderItem text='Count' width='33%' />
    </Box>
  )
}

function TokenAudit({audit}) {
  return (
    <Box flex={false} direction='row' pad='small' border={{side: 'bottom', color: 'light-5'}} align='center'>
      <HeaderItem text={audit.ip} width='33%' nobold />
      <HeaderItem text={moment(audit.timestamp).format('lll')} width='33%' nobold />
      <HeaderItem text={audit.count} width='33%' nobold />
    </Box>
  )
}

function TokenAudits({id}) {
  const [listRef, setListRef] = useState(null)
  const {data, loading, fetchMore} = useQuery(TOKEN_AUDITS, {variables: {id}, fetchPolicy: 'cache-and-network'})

  if (!data) return null

  const {audits: {pageInfo, edges}} = data.token

  if (edges.length === 0) {
    return (
      <Box fill align='center' justify='center' pad='medium'>
        <Text size='small' weight={500}>Token has yet to be used</Text>
      </Box>
    )
  }

  return (
    <Box fill>
      <AuditHeader />
      <Box fill>
        <StandardScroller
          listRef={listRef}
          setListRef={setListRef}
          hasNextPage={pageInfo.hasNextPage}
          items={edges}
          loading={loading}
          placeholder={Placeholder}
          mapper={({node}) => <TokenAudit key={node.id} audit={node} />} 
          loadNextPage={() => pageInfo.hasNextPage && fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult: {token}}) => deepUpdate(prev, 'token', (prevToken) => (
              extendConnection(prevToken, token.audits, 'audits')
            ))
          })} />
      </Box>
    </Box>
  )
}

function Token({token: {token, insertedAt, id}}) {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const doConfirm = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()
    setConfirm(true)
  }, [setConfirm])

  const [mutation, {loading}] = useMutation(DELETE_TOKEN, {
    variables: {id},
    update: (cache, { data: { deleteToken } }) => updateCache(cache, {
      query: TOKENS_Q,
      update: (prev) => removeConnection(prev, deleteToken, 'tokens')
    }),
    onCompleted: () => setConfirm(false)
  })

  return (
    <>
    <Box onClick={() => setOpen(!open)} hoverIndicator='light-1' direction='row'
      border={{side: 'bottom', color: BORDER_COLOR}}>
      <Box width='100%' pad={{left: 'small', vertical: 'xsmall'}} direction='row' gap='xsmall' align='center'>
        <Copyable
          noBorder
          pillText='Copied access token'
          text={token}
          displayText={token.substring(0, 9) + "x".repeat(15)} />
      </Box>
      <Box width={CELL_WIDTH} pad='xsmall' direction='row' gap='medium' align='center' justify='end'>
        <Text size='small'>{moment(insertedAt).fromNow()}</Text>
        <Icon icon={Trash} tooltip='Delete' hover='light-3' onClick={doConfirm} />
      </Box>
    </Box>
    {confirm && (
      <Confirm 
        description='Double check to ensure no automation is still using it'
        cancel={() => setConfirm(false)}
        submit={mutation}
        loading={loading}
        label='Delete' />
    )}
    {open && (
      <Layer onEsc={() => setOpen(false)} onClickOutside={() => setOpen(false)}>
        <Box width='50vw' height='60vh'>
          <ModalHeader text='Audit Logs' setOpen={setOpen} />
          <TokenAudits id={id} />
        </Box>
      </Layer>
    )}
    </>
  )
}

function EmptyTokens() {
  return (
    <Box pad='small'>
      <Text size='small'>No tokens</Text>
    </Box>
  )
}

export function Tokens() {
  const {data, fetchMore} = useQuery(TOKENS_Q)
  const [mutation, {loading}] = useMutation(CREATE_TOKEN, {
    update: (cache, { data: { createToken } }) => {
      const prev = cache.readQuery({query: TOKENS_Q})
      cache.writeQuery({query: TOKENS_Q, data: {
        ...prev,
        tokens: {...prev.tokens, edges: [{__typename: 'PersistedTokenEdge', node: createToken}, ...prev.tokens.edges]}
      }})
    }
  })

  if (!data) return null

  const {edges, pageInfo} = data.tokens

  return (
    <>
    <Box fill>
      <Scroller
        id='tokens'
        edges={edges}
        emptyState={<EmptyTokens />}
        style={{overflow: 'auto', height: '100%', width: '100%'}}
        mapper={({node}, next) => (
          <Token
            key={node.id}
            token={node}
            hasNext={!!next.node} />
        )}
        onLoadMore={() => {
          pageInfo.hasNextPage && fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult: {tokens}}) => extendConnection(prev, tokens, 'tokens')
          })
        }}
      />
    </Box>
    <SectionPortal>
      <Button label='Create' onClick={mutation} loading={loading} />
    </SectionPortal>
    </>
  )
}