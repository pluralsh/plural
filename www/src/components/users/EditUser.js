import React, { useContext, useState, useEffect } from 'react'
import { Box, Text } from 'grommet'
import { Trash } from 'grommet-icons'
import { useMutation, useQuery } from 'react-apollo'
import { UPDATE_USER, CREATE_TOKEN, TOKENS_Q, DELETE_TOKEN } from './queries'
import { InputCollection, ResponsiveInput, Button, Scroller, Copyable, Expander, HoveredBackground, BORDER_COLOR } from 'forge-core'
import { CurrentUserContext } from '../login/CurrentUser'
import Avatar from '../users/Avatar'
import moment from 'moment'
import { BreadcrumbContext } from '../Forge'
import Installations from '../repos/Installations'
import Webhooks from './Webhooks'
import { DetailContainer } from '../repos/Installation'

const LABEL_WIDTH = '60px'
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

function Tokens() {
  const {data, loading, fetchMore} = useQuery(TOKENS_Q)
  const [mutation] = useMutation(CREATE_TOKEN, {
    update: (cache, { data: { createToken } }) => {
      const prev = cache.readQuery({query: TOKENS_Q})
      cache.writeQuery({query: TOKENS_Q, data: {
        ...prev,
        tokens: {
          ...prev.tokens,
          edges: [{__typename: 'PersistedTokenEdge', node: createToken}, ...prev.tokens.edges]
        }
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
              updateQuery: (prev, {fetchMoreResult: {edges, pageInfo}}) => {
                return edges.length ? {
                  ...prev, tokens: {
                    ...prev.tokens,
                    pageInfo,
                    edges: [...prev.tokens.edges, ...edges]
                  }
                } : prev
              }
            })
          }}
        />
      </Box>
    </Box>
  )
}

export default function EditUser() {
  const me = useContext(CurrentUserContext)
  const [attributes, setAttributes] = useState({name: me.name, email: me.email})
  const [mutation, {loading, error}] = useMutation(UPDATE_USER, {
    variables: {attributes}
  })
  const {setBreadcrumbs} = useContext(BreadcrumbContext)
  useEffect(() => {
    setBreadcrumbs([
      {url: `/me/edit`, text: me.email}
    ])
  }, [me, setBreadcrumbs])

  return (
    <Box direction='row' gap='small' pad='medium' height='100%'>
      <Box width='70%' gap='medium' pad='small' height='100%'>
        <Installations edit />
        <Webhooks />
        <Tokens />
      </Box>
      <Box width='30%'>
        <DetailContainer>
          <Box direction='row' align='center' pad='small' gap='small'>
            <Avatar user={me} size='100px' />
            <Box>
              <Text>{me.name}</Text>
              <Text size='small'>{me.email}</Text>
            </Box>
          </Box>
          <Box>
            <Expander text='Update attributes'>
              <Box pad='xsmall'>
                <InputCollection>
                  <ResponsiveInput
                    label='name'
                    labelWidth={LABEL_WIDTH}
                    placeholder='your name'
                    value={attributes.name}
                    onChange={(e) => setAttributes({...attributes, name: e.target.value})} />
                  <ResponsiveInput
                    label='email'
                    labelWidth={LABEL_WIDTH}
                    placeholder='your email'
                    value={attributes.email}
                    onChange={(e) => setAttributes({...attributes, email: e.target.value})} />
                </InputCollection>
              </Box>
            </Expander>
          </Box>
          <Box border='top'>
            <Expander text='Update password'>
              <Box pad='xsmall'>
                <InputCollection>
                  <ResponsiveInput
                    label='password'
                    placeholder='your password'
                    labelWidth='80px'
                    type='password'
                    value={attributes.password || ''}
                    onChange={(e) => setAttributes({...attributes, password: e.target.value})} />
                </InputCollection>
              </Box>
            </Expander>
          </Box>
          <Box pad='small' direction='row' justify='end'>
            <Button
              pad={{horizontal: 'medium', vertical: 'xsmall'}}
              loading={loading}
              error={error}
              label='Update'
              onClick={mutation}
              round='xsmall' />
          </Box>
        </DetailContainer>
      </Box>
    </Box>
  )
}