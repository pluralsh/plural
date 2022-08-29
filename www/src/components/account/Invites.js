import { useMutation, useQuery } from '@apollo/client'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Div, Flex, Text } from 'honorable'
import { useTheme } from 'styled-components'
import { LoopingLogo, SearchIcon } from 'pluralsh-design-system'

import ListInput from 'components/utils/ListInput'

import CopyableButton from '../utils/CopyableButton'
import { List, ListItem } from '../utils/List'

import {
  extendConnection,
  removeConnection,
  updateCache,
} from '../../utils/graphql'

import { Placeholder } from '../accounts/Audits'
import { inviteLink } from '../accounts/CreateInvite'
import { DELETE_INVITE, INVITES_Q } from '../accounts/queries'
import { DeleteIconButton } from '../utils/IconButtons'
import { StandardScroller } from '../utils/SmoothScroller'

import { Confirm } from './Confirm'

function DeleteInvite({ invite }) {
  const [confirm, setConfirm] = useState(false)
  const [mutation, { loading, error }] = useMutation(DELETE_INVITE, {
    variables: { id: invite.secureId },
    onCompleted: () => setConfirm(false),
    update: (cache, { data: { deleteInvite } }) => updateCache(cache, {
      query: INVITES_Q,
      update: invites => removeConnection(invites, deleteInvite, 'invites'),
    }),
  })

  return (
    <>
      <DeleteIconButton onClick={() => setConfirm(true)} />
      <Confirm
        open={confirm}
        close={() => setConfirm(false)}
        title="Delete Invite?"
        text="You can always recreate it if you want"
        destructive
        submit={mutation}
        loading={loading}
        error={error}
      />
    </>
  )
}

function Invite(invite) {
  const theme = useTheme()
  const { email, insertedAt } = invite

  return (
    <Flex
      width="100%"
      flexDirection="row"
      gap="large"
      alignItems="center"
    >
      <Text
        {...theme.partials.text.body1Bold}
        flexGrow={1}
      >
        {email}
      </Text>
      <Text
        caption
        color="text-xlight"
      >
        {`Created ${moment(insertedAt).format('lll')}`}
      </Text>
      <CopyableButton
        secondary
        small
        copyText={inviteLink(invite)}
      >
        Copy invite link
      </CopyableButton>
      <DeleteInvite invite={invite} />
    </Flex>
  )
}

export function Invites() {
  const [q, setQ] = useState('')
  const [listRef, setListRef] = useState(null)
  const { data, loading, fetchMore } = useQuery(INVITES_Q, {
    variables: { q },
    fetchPolicy: 'cache-and-network',
  })
  const [dataCache, setDataCache] = useState(data)

  useEffect(() => {
    if (data) {
      setDataCache(data)
    }
  }, [data])

  const {
    invites: { pageInfo, edges },
  } = data || dataCache || { invites: {} }

  return (
    <List>
      <ListInput
        width="100%"
        value={q}
        placeholder="Search an invite"
        startIcon={<SearchIcon color="text-light" />}
        onChange={({ target: { value } }) => setQ(value)}
        flexGrow={0}
      />
      <Div
        flexGrow={1}
        width="100%"
      >
        {!data && !dataCache ? (
          <LoopingLogo />
        ) : (
          <StandardScroller
            listRef={listRef}
            setListRef={setListRef}
            hasNextPage={pageInfo.hasNextPage}
            items={edges}
            mapper={({ node }, { prev, next }) => (
              <ListItem
                first={!prev.node}
                last={!next.node}
              >
                <Invite {...node} />
              </ListItem>
            )}
            loading={loading}
            placeholder={Placeholder}
            loadNextPage={() => pageInfo.hasNextPage
              && fetchMore({
                variables: { cursor: pageInfo.endCursor },
                updateQuery: (prev, { fetchMoreResult: { invites } }) => extendConnection(prev, invites, 'invites'),
              })}
          />
        )}
      </Div>
    </List>
  )
}
