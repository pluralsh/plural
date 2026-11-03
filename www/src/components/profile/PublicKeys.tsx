import { useMutation, useQuery } from '@apollo/client'
import moment from 'moment'
import { useState } from 'react'

import { Flex } from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

import isEmpty from 'lodash/isEmpty'

import { Placeholder } from '../utils/Placeholder'

import { extendConnection } from '../../utils/graphql'
import { Confirm } from '../utils/Confirm'

import { DELETE_KEY, LIST_KEYS } from '../users/queries'
import { StandardScroller } from '../utils/SmoothScroller'

import { DeleteIconButton } from '../utils/IconButtons'

import LoadingIndicator from '../utils/LoadingIndicator'
import { Body1P, Body2P, CaptionP, SpanSC } from '../utils/Typography'
import { SubpageHeader } from '../utils/layout/SubpageLayout'

import { InfoTooltip } from './InfoTooltip'
import { ListItem } from './ListItem'

const TOOLTIP =
  'Public keys are used to share access to an encrypted repository.'

function PublicKey({ pubkey: key, first, last }: any) {
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
        <Flex
          direction="column"
          grow={1}
          gap="xsmall"
        >
          <Flex
            direction="row"
            align="center"
            gap="small"
          >
            <Body1P
              as="span"
              css={{ fontWeight: 600 }}
            >
              {key.name}
            </Body1P>
          </Flex>
          <SpanSC $color="text-light">{key.digest.toLowerCase()}</SpanSC>
        </Flex>
        <Flex
          flex="0 0 auto"
          direction="row"
          align="center"
          gap="small"
        >
          <CaptionP
            as="span"
            $color="text-xlight"
            style={{ whiteSpace: 'nowrap' }}
          >
            added on {moment(key.insertedAt).format('lll')}
          </CaptionP>
          <DeleteIconButton onClick={() => setConfirm(true)} />
        </Flex>
      </ListItem>
      <Confirm
        open={confirm}
        title="Delete Public Key"
        text="Are you sure you want to delete this public key?"
        close={() => setConfirm(false)}
        submit={() => mutation()}
        loading={loading}
        destructive
        error={error}
      />
    </>
  )
}

export function PublicKeys() {
  const theme = useTheme()
  const [listRef, setListRef] = useState<any>(null)
  const { data, loading, fetchMore } = useQuery(LIST_KEYS)

  if (!data) return <LoadingIndicator />

  const { edges, pageInfo } = data.publicKeys ?? {}

  return (
    <div css={{ marginBottom: theme.spacing.large }}>
      <SubpageHeader
        title={
          <>
            Public keys
            <InfoTooltip label={TOOLTIP} />
          </>
        }
      />
      <Flex
        direction="column"
        width="100%"
        height="100%"
      >
        {edges?.length ? (
          <StandardScroller
            listRef={listRef}
            setListRef={setListRef}
            items={edges}
            placeholder={Placeholder}
            mapper={({ node }, { prev, next }) => (
              <PublicKey
                key={node.id}
                pubkey={node}
                first={isEmpty(prev.node)}
                last={isEmpty(next.node)}
              />
            )}
            loading={loading}
            hasNextPage={pageInfo?.hasNextPage}
            loadNextPage={() =>
              pageInfo?.hasNextPage &&
              fetchMore({
                variables: { cursor: pageInfo.endCursor },
                updateQuery: (prev, { fetchMoreResult: { publicKeys } }) =>
                  extendConnection(prev, publicKeys, 'publicKeys'),
              })
            }
          />
        ) : (
          <Body2P>You do not have any public keys yet.</Body2P>
        )}
      </Flex>
    </div>
  )
}
