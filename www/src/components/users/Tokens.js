import { useCallback, useState } from 'react'
import { Box, Layer, Text } from 'grommet'
import { useMutation, useQuery } from '@apollo/client'
import { BORDER_COLOR, Button, Copyable, GraphView, ListView, Scroller, Trash } from 'forge-core'
import moment from 'moment'
import lookup from 'country-code-lookup'

import { deepUpdate, extendConnection, removeConnection, updateCache } from '../../utils/graphql'
import { FixedScroller } from '../utils/SmoothScroller'
import { HeaderItem } from '../repos/Docker'
import { SectionPortal } from '../Explore'
import { Placeholder } from '../accounts/Audits'
import { Icon } from '../accounts/Group'
import { Confirm } from '../utils/Confirm'
import { formatLocation } from '../../utils/geo'
import { Chloropleth } from '../utils/Chloropleth'
import { ModalHeader } from '../ModalHeader'

import { CREATE_TOKEN, DELETE_TOKEN, TOKENS_Q, TOKEN_AUDITS, TOKEN_METRICS } from './queries'
import { obscure } from './utils'

function AuditHeader() {
  return (
    <Box
      flex={false}
      direction="row"
      pad="small"
      gap="xsmall"
      border={{ side: 'bottom', color: 'border' }}
      align="center"
    >
      <HeaderItem
        text="IP"
        width="33%"
      />
      <HeaderItem
        text="Location"
        width="20%"
      />
      <HeaderItem
        text="Timestamp"
        width="23%"
      />
      <HeaderItem
        text="Count"
        width="23%"
      />
    </Box>
  )
}

function TokenAudit({ audit }) {
  return (
    <Box
      flex={false}
      direction="row"
      pad="small"
      border={{ side: 'bottom', color: 'border' }}
      align="center"
      height="50px"
    >
      <HeaderItem
        text={audit.ip}
        width="33%"
        nobold
      />
      <HeaderItem
        text={formatLocation(audit.country, audit.city)}
        width="20%"
        nobold
      />
      <HeaderItem
        text={moment(audit.timestamp).format('lll')}
        width="23%"
        nobold
      />
      <HeaderItem
        text={audit.count}
        width="23%"
        nobold
      />
    </Box>
  )
}

function TokenAudits({ id }) {
  const { data, loading, fetchMore } = useQuery(TOKEN_AUDITS, { variables: { id }, fetchPolicy: 'cache-and-network' })

  if (!data) return null

  const { audits: { pageInfo, edges } } = data.token

  if (edges.length === 0) {
    return (
      <Box
        fill
        align="center"
        justify="center"
        pad="medium"
      >
        <Text
          size="small"
          weight={500}
        >Token has yet to be used
        </Text>
      </Box>
    )
  }

  return (
    <Box fill>
      <AuditHeader />
      <Box fill>
        <FixedScroller
          hasNextPage={pageInfo.hasNextPage}
          itemSize={50}
          items={edges}
          loading={loading}
          placeholder={Placeholder}
          mapper={({ node }) => (
            <TokenAudit
              key={node.id}
              audit={node}
            />
          )}
          loadNextPage={() => pageInfo.hasNextPage && fetchMore({
            variables: { cursor: pageInfo.endCursor },
            updateQuery: (prev, { fetchMoreResult: { token } }) => deepUpdate(prev, 'token', prevToken => (
              extendConnection(prevToken, token.audits, 'audits')
            )),
          })}
        />
      </Box>
    </Box>
  )
}

function TokenMetrics({ id }) {
  const { data } = useQuery(TOKEN_METRICS, {
    variables: { id },
    fetchPolicy: 'cache-and-network',
  })

  if (!data) return null

  const metrics = data.token.metrics.map(({ country, count }) => ({
    id: lookup.byIso(country).iso3, value: count,
  }))

  return (
    <Box
      fill="horizontal"
      height="50vh"
      pad="small"
    >
      <Chloropleth data={metrics} />
    </Box>
  )
}

function Token({ token: { token, insertedAt, id } }) {
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(false)
  const doConfirm = useCallback(e => {
    e.stopPropagation()
    e.preventDefault()
    setConfirm(true)
  }, [setConfirm])

  const [mutation, { loading }] = useMutation(DELETE_TOKEN, {
    variables: { id },
    update: (cache, { data: { deleteToken } }) => updateCache(cache, {
      query: TOKENS_Q,
      update: prev => removeConnection(prev, deleteToken, 'tokens'),
    }),
    onCompleted: () => setConfirm(false),
  })
  const close = useCallback(() => setModal(null), [setModal])

  return (
    <>
      <Box
        direction="row"
        border={{ side: 'bottom', color: BORDER_COLOR }}
      >
        <Box
          fill="horizontal"
          pad={{ left: 'small', vertical: 'xsmall' }}
          direction="row"
          gap="xsmall"
          align="center"
        >
          <Copyable
            noBorder
            pillText="Copied access token"
            text={token}
            displayText={obscure(token)}
          />
        </Box>
        <Box
          flex={false}
          pad="xsmall"
          direction="row"
          gap="small"
          align="center"
          justify="end"
        >
          <Box pad={{ right: 'small' }}>
            <Text size="small">{moment(insertedAt).fromNow()}</Text>
          </Box>
          <Icon
            icon={GraphView}
            tooltip="Metrics"
            hover="hover"
            onClick={() => setModal({
              header: 'Usage Metrics',
              content: <TokenMetrics id={id} />,
            })}
          />
          <Icon
            icon={ListView}
            tooltip="Audits"
            hover="hover"
            onClick={() => setModal({
              header: 'Audit Logs',
              content: <TokenAudits id={id} />,
            })}
          />
          <Icon
            icon={Trash}
            tooltip="Delete"
            hover="hover"
            onClick={doConfirm}
            iconAttrs={{ color: 'red-dark' }}
          />
        </Box>
      </Box>
      {confirm && (
        <Confirm
          description="Double check to ensure no automation is still using it"
          cancel={() => setConfirm(false)}
          submit={mutation}
          loading={loading}
          label="Delete"
        />
      )}
      {modal && (
        <Layer
          onEsc={close}
          onClickOutside={close}
        >
          <Box
            width="50vw"
            height="60vh"
          >
            <ModalHeader
              text={modal.header}
              setOpen={close}
            />
            {modal.content}
          </Box>
        </Layer>
      )}
    </>
  )
}

function EmptyTokens() {
  return (
    <Box pad="small">
      <Text size="small">No tokens</Text>
    </Box>
  )
}

export function Tokens() {
  const { data, fetchMore } = useQuery(TOKENS_Q)
  const [mutation, { loading }] = useMutation(CREATE_TOKEN, {
    update: (cache, { data: { createToken } }) => {
      const prev = cache.readQuery({ query: TOKENS_Q })
      cache.writeQuery({ query: TOKENS_Q,
        data: {
          ...prev,
          tokens: { ...prev.tokens, edges: [{ __typename: 'PersistedTokenEdge', node: createToken }, ...prev.tokens.edges] },
        } })
    },
  })

  if (!data) return null

  const { edges, pageInfo } = data.tokens

  return (
    <>
      <Box fill>
        <Scroller
          id="tokens"
          edges={edges}
          emptyState={<EmptyTokens />}
          style={{ overflow: 'auto', height: '100%', width: '100%' }}
          mapper={({ node }, next) => (
            <Token
              key={node.id}
              token={node}
              hasNext={!!next.node}
            />
          )}
          onLoadMore={() => {
            if (pageInfo.hasNextPage) {
              fetchMore({
                variables: { cursor: pageInfo.endCursor },
                updateQuery: (prev, { fetchMoreResult: { tokens } }) => extendConnection(prev, tokens, 'tokens'),
              })
            }
          }}
        />
      </Box>
      <SectionPortal>
        <Button
          label="Create"
          onClick={mutation}
          loading={loading}
        />
      </SectionPortal>
    </>
  )
}
