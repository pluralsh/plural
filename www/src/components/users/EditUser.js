import React, {useContext, useState, useEffect} from 'react'
import {Box, Text} from 'grommet'
import {Trash} from 'grommet-icons'
import {useMutation, useQuery} from 'react-apollo'
import {UPDATE_USER, CREATE_TOKEN, TOKENS_Q, DELETE_TOKEN} from './queries'
import InputField from '../utils/InputField'
import Button, {SecondaryButton} from '../utils/Button'
import {CurrentUserContext} from '../login/CurrentUser'
import Avatar from '../users/Avatar'
import Scroller from '../utils/Scroller'
import moment from 'moment'
import Copyable from '../utils/Copyable'
import {BreadcrumbContext} from '../Chartmart'
import Expander from '../utils/Expander'
import Installations from '../repos/Installations'

const LABEL_WIDTH = '60px'
const CELL_WIDTH='200px'

function Token({token: {token, insertedAt, id}, hasNext}) {
  const [hover, setHover] = useState(false)
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
    <Box
      style={{cursor: 'pointer'}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      background={hover ? 'light-2' : null}
      border={hasNext ? 'bottom' : null}
      direction='row'>
      <Box width='100%' pad={{left: 'small', vertical: 'xsmall'}} direction='row' gap='xsmall' align='center'>
        <Copyable
          noBorder
          pillText='Copied access token'
          text={token}
          displayText={token.substring(0, 9) + "x".repeat(15)} />
      </Box>
      <Box width={CELL_WIDTH} pad='xsmall' direction='row' gap='medium' align='center' justify='end'>
        <Text size='small'>{moment(insertedAt).fromNow()}</Text>
        <Trash size='12px' onClick={mutation} />
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
    <Box border>
      <Box
        direction='row'
        background='light-3'
        border='bottom'
        align='center'
        elevation='xsmall'
        pad={{vertical: 'xsmall', horizontal: 'small'}}>
        <Box width='100%'>
          <Text size='small' style={{fontWeight: 500}}>Access Tokens</Text>
        </Box>
        <Box width={CELL_WIDTH}>
          <SecondaryButton
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
            if (!pageInfo.hasNextPage) return

            fetchMore({
              variables: {cursor: pageInfo.endCursor},
              updateQuery: (prev, {fetchMoreResult}) => {
                const {edges, pageInfo} = fetchMoreResult.repositories
                return edges.length ? {
                  ...prev,
                  tokens: {
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
    <Box direction='row' gap='small' pad='medium'>
      <Box width='70%' gap='medium' pad='small'>
        <Installations />
        <Tokens />
      </Box>
      <Box width='30%' elevation='small'>
        <Box direction='row' align='center' pad='small' gap='small'>
          <Avatar user={me} size='100px' />
          <Box>
            <Text>{me.name}</Text>
            <Text size='small'>{me.email}</Text>
          </Box>
        </Box>
        <Box>
          <Expander text='Update attributes' open>
            <Box gap='small' pad='small'>
              <InputField
                label='name'
                labelWidth={LABEL_WIDTH}
                placeholder='your name'
                value={attributes.name}
                onChange={(e) => setAttributes({...attributes, name: e.target.value})} />
              <InputField
                label='email'
                labelWidth={LABEL_WIDTH}
                placeholder='your email'
                value={attributes.email}
                onChange={(e) => setAttributes({...attributes, email: e.target.value})} />
            </Box>
          </Expander>
        </Box>
        <Box border='top'>
          <Expander text='Update password'>
            <Box pad='small'>
              <InputField
                label='password'
                placeholder='your password'
                labelWidth='80px'
                type='password'
                value={attributes.password || ''}
                onChange={(e) => setAttributes({...attributes, password: e.target.value})} />
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
      </Box>
    </Box>
  )
}