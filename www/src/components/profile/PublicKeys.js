import { useMutation, useQuery } from '@apollo/client'
import { Box } from 'grommet'
import { Div, Span, Text } from 'honorable'
import moment from 'moment'
import { useState } from 'react'

import { ErrorIcon, PageTitle, Tooltip } from 'pluralsh-design-system'

import { isEmpty } from 'lodash/lang'

import { extendConnection } from '../../utils/graphql'
import { Confirm } from '../account/Confirm'
import { Placeholder } from '../accounts/Audits'

import { DELETE_KEY, LIST_KEYS } from '../users/queries'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { StandardScroller } from '../utils/SmoothScroller'

import { DeleteIcon } from './Icon'
import { ListItem } from './ListItem'

const TOOLTIP = 'Public keys are used to share access to an encrypted repository.'

function PublicKey({ pubkey: key, first, last }) {
  const [confirm, setConfirm] = useState(false)
  const [mutation, { loading, error }] = useMutation(DELETE_KEY, {
    variables: { id: key.id },
    refetchQueries: [{ query: LIST_KEYS }],
    onCompleted: () => setConfirm(false),
  })

  return (
    <>
      <ListItem
        first={first}
        last={last}
      >
        <Box
          flex="grow"
          gap="xsmall"
        >
          <Box
            direction="row"
            align="center"
            gap="small"
          >
            <Span
              body1
              fontWeight="600"
            >
              {key.name}
            </Span>
          </Box>
          <Span color="text-light">{key.digest.toLowerCase()}</Span>
        </Box>
        <Box
          flex={false}
          direction="row"
          align="center"
          gap="small"
        >
          <Text
            color="text-xlight"
            caption
            style={{ whiteSpace: 'nowrap' }}
          >
            added on {moment(key.insertedAt).format('lll')}
          </Text>
          <DeleteIcon onClick={() => setConfirm(true)} />
        </Box>
      </ListItem>
      <Confirm
        open={confirm}
        title="Delete Public Key"
        text="Are you sure you want to delete this public key?"
        close={() => setConfirm(false)}
        submit={mutation}
        loading={loading}
        destructive
        error={error}
      />
    </>
  )
}

export function PublicKeys() {
  const [listRef, setListRef] = useState(null)
  const { data, loading, fetchMore } = useQuery(LIST_KEYS)

  if (!data) return <LoopingLogo />

  const { edges, pageInfo } = data.publicKeys

  return (
    <Box fill>
      <PageTitle
        heading="Public keys"
        justifyContent="flex-start"
      >
        <Tooltip
          width="315px"
          label={TOOLTIP}
        >
          <Box
            flex={false}
            pad="6px"
            round="xxsmall"
            hoverIndicator="fill-two"
            onClick
          >
            <ErrorIcon /> {/* TODO: Change to info icon. */}
          </Box>
        </Tooltip>
      </PageTitle>
      <Box fill>
        {edges?.length
          ? (
            <StandardScroller
              listRef={listRef}
              setListRef={setListRef}
              items={edges}
              placeholder={Placeholder}
              mapper={({ node }, { prev, next }) => (
                <PublicKey
                  pubkey={node}
                  first={isEmpty(prev.node)}
                  last={isEmpty(next.node)}
                />
              )}
              loading={loading}
              hasNextPage={pageInfo.hasNextPage}
              loadNextPage={pageInfo.hasNextPage && fetchMore({
                variables: { cursor: pageInfo.endCursor },
                updateQuery: (prev, { fetchMoreResult: { publicKeys } }) => extendConnection(prev, publicKeys, 'publicKeys'),
              })}
            />
          ) : (<Div body2>No public keys found.</Div>)}
      </Box>
    </Box>
  )
}
