import { useState } from 'react'
import { Button, Key as KeyIcon, Scroller } from 'forge-core'

import { Box, Markdown, Text } from 'grommet'
import moment from 'moment'

import { useMutation, useQuery } from '@apollo/client'

import { extendConnection } from '../../utils/graphql'
import { Confirm } from '../utils/Confirm'

import { DELETE_KEY, LIST_KEYS } from './queries'

function NoKeys() {
  return (
    <Box
      fill
      align="center"
      justify="center"
    >
      <Markdown>No public keys uploaded yet, run `plural crypto setup-keys` to upload one</Markdown>
    </Box>
  )
}

function Key({ publicKey }) {
  const [confirm, setConfirm] = useState(false)
  const [mutation, { loading }] = useMutation(DELETE_KEY, {
    variables: { id: publicKey.id },
    refetchQueries: [{ query: LIST_KEYS }],
    onCompleted: () => setConfirm(false),
  })

  return (
    <>
      <Box
        border={{ side: 'bottom' }}
        pad="small"
        direction="row"
        align="center"
        gap="small"
      >
        <Box
          flex={false}
          width="50px"
          align="center"
          justify="center"
        >
          <KeyIcon size="25px" />
        </Box>
        <Box
          fill="horizontal"
          gap="2px"
        >
          <Text
            size="small"
            weight={500}
          >{publicKey.name}
          </Text>
          <Text size="small"><code>{publicKey.digest.toLowerCase()}</code></Text>
          <Text size="small">added on {moment(publicKey.insertedAt).format('lll')}</Text>
        </Box>
        <Box flex={false}>
          <Button
            label="delete"
            background="red-dark"
            onClick={() => setConfirm(true)}
          />
        </Box>
      </Box>
      {confirm && (
        <Confirm
          description="Please ensure the key is no longer being used for repo encryption first"
          label="Delete"
          submit={mutation}
          loading={loading}
          cancel={() => setConfirm(false)}
        />
      )}
    </>
  )
}

export function Keys() {
  const { data, fetchMore } = useQuery(LIST_KEYS)
  if (!data) return null

  const { edges, pageInfo } = data.publicKeys

  return (
    <Scroller
      id="webhooks"
      edges={edges}
      emptyState={<NoKeys />}
      style={{ overflow: 'auto', height: '100%', width: '100%' }}
      mapper={({ node }) => (
        <Key
          key={node.id}
          publicKey={node}
        />
      )}
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({
        variables: { cursor: pageInfo.endCursor },
        updateQuery: (prev, { fetchMoreResult: { publicKeys } }) => extendConnection(prev, publicKeys, 'publicKeys'),
      })}
    />
  )
}
