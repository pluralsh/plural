import React from 'react'
import { Box, Text } from 'grommet'
import { Trash } from 'grommet-icons'
import { useMutation, useQuery } from 'react-apollo'
import { CREATE_TOKEN, TOKENS_Q, DELETE_TOKEN } from './queries'
import { Button, Scroller, Copyable, HoveredBackground, BORDER_COLOR } from 'forge-core'
import moment from 'moment'

const CELL_WIDTH='200px'

function Token({token: {token, insertedAt, id}, hasNext}) {
  const [mutation] = useMutation(DELETE_TOKEN, {
    variables: {id},
    update: (cache, { data: { deleteToken } }) => {
      const prev = cache.readQuery({query: TOKENS_Q})
      cache.writeQuery({query: TOKENS_Q, data: {
        ...prev,
        tokens: {
          ...prev.tokens,
          edges: prev.tokens.edges.filter(({node: {id}}) => id !== deleteToken.id)
        }
      }})
    }
  })

  return (
    <Box onClick={() => null} hoverIndicator='light-2' direction='row'
      border={hasNext ? {side: 'bottom', color: BORDER_COLOR} : null}>
      <Box width='100%' pad={{left: 'small', vertical: 'xsmall'}} direction='row' gap='xsmall' align='center'>
        <Copyable
          noBorder
          pillText='Copied access token'
          text={token}
          displayText={token.substring(0, 9) + "x".repeat(15)} />
      </Box>
      <Box width={CELL_WIDTH} pad='xsmall' direction='row' gap='medium' align='center' justify='end'>
        <Text size='small'>{moment(insertedAt).fromNow()}</Text>
        <HoveredBackground>
          <Box accentable pad='xsmall' focusIndicator={false} onClick={mutation}>
            <Trash size='12px' />
          </Box>
        </HoveredBackground>
      </Box>
    </Box>
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
  const {data, loading, fetchMore} = useQuery(TOKENS_Q)
  const [mutation] = useMutation(CREATE_TOKEN, {
    update: (cache, { data: { createToken } }) => {
      const prev = cache.readQuery({query: TOKENS_Q})
      cache.writeQuery({query: TOKENS_Q, data: {
        ...prev,
        tokens: {...prev.tokens, edges: [{__typename: 'PersistedTokenEdge', node: createToken}, ...prev.tokens.edges]}
      }})
    }
  })

  if (!data || loading) return null
  const {edges, pageInfo} = data.tokens
  return (
    <Box>
      <Box
        direction='row'
        border={{side: 'bottom', color: BORDER_COLOR}}
        align='center'
        pad={{vertical: 'xsmall', horizontal: 'small'}}>
        <Box width='100%'>
          <Text size='small' style={{fontWeight: 500}}>Access Tokens</Text>
        </Box>
        <Box width={CELL_WIDTH}>
          <Button
            pad={{horizontal: 'medium', vertical: 'xsmall'}}
            label='Create'
            onClick={mutation}
            round='xsmall' />
        </Box>
      </Box>
      <Box>
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
              updateQuery: (prev, {fetchMoreResult: {edges, pageInfo}}) => ({
                ...prev, tokens: {
                  ...prev.tokens,
                  pageInfo,
                  edges: [...prev.tokens.edges, ...edges]
                }
              })
            })
          }}
        />
      </Box>
    </Box>
  )
}