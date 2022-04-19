import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'

import { Copyable, Trash } from 'forge-core'

import moment from 'moment'

import { Box, Text } from 'grommet'

import { HeaderItem } from '../repos/DockerImages'

import { Confirm } from '../utils/Confirm'

import { extendConnection, removeConnection, updateCache } from '../../utils/graphql'

import { StandardScroller } from '../utils/SmoothScroller'

import { SectionContentContainer } from '../Explore'

import { TableRow } from './Domains'
import { DELETE_INVITE, INVITES_Q } from './queries'
import { inviteLink } from './CreateInvite'

import { Icon } from './Group'

import { Placeholder } from './Audits'

function InviteHeader() {
  return (
    <TableRow>
      <HeaderItem
        text="Email"
        width="40%"
      />
      <HeaderItem
        text="Link"
        width="40%"
      />
      <HeaderItem
        text="Created On"
        width="20%"
      />
    </TableRow>
  )
}

function DeleteInvite({ invite }) {
  const [open, setOpen] = useState(false)
  const [mutation, { loading, error }] = useMutation(DELETE_INVITE, {
    variables: { id: invite.secureId },
    onCompleted: () => setOpen(false),
    update: (cache, { data: { deleteInvite } }) => updateCache(cache, {
      query: INVITES_Q,
      update: invites => removeConnection(invites, deleteInvite, 'invites'),
    }),
  })

  return (
    <>
      <Icon
        icon={Trash}
        tooltip="delete"
        onClick={() => setOpen(true)}
        iconAttrs={{ color: 'error' }}
      />
      {open && (
        <Confirm
          error={error}
          header="Delete invite"
          description={`This will delete the invite for ${invite.email} permanently`}
          submit={mutation}
          cancel={() => setOpen(false)}
          label="Delete"
          loading={loading}
        />
      )}
    </>
  )
}

function InviteRow({ invite }) {
  return (
    <TableRow>
      <HeaderItem
        text={invite.email}
        width="40%"
      />
      <Box
        width="40%"
        align="center"
        direction="row"
      >
        <Copyable
          text={inviteLink(invite)}
          pillText="Copied invite link"
        />
      </Box>
      <Box
        direction="row"
        width="20%"
        align="center"
      >
        <Box fill="horizontal">
          <Text size="small">{moment(invite.insertedAt).format('lll')}</Text>
        </Box>
        <DeleteInvite invite={invite} />
      </Box>
    </TableRow>
  )
}

export function Invites() {
  const [listRef, setListRef] = useState(null)
  const { data, loading, fetchMore } = useQuery(INVITES_Q)

  if (!data) return null

  const { invites: { pageInfo, edges } } = data

  return (
    <SectionContentContainer header="Invites">
      <Box fill>
        <InviteHeader />
        <Box fill>
          <StandardScroller
            listRef={listRef}
            setListRef={setListRef}
            hasNextPage={pageInfo.hasNextPage}
            items={edges}
            loading={loading}
            placeholder={Placeholder}
            mapper={({ node }) => (
              <InviteRow
                key={node.id}
                invite={node}
              />
            )}
            loadNextPage={() => pageInfo.hasNextPage && fetchMore({
              variables: { cursor: pageInfo.endCursor },
              updateQuery: (prev, { fetchMoreResult: { invites } }) => extendConnection(prev, invites, 'invites'),
            })}
          />
        </Box>
      </Box>
    </SectionContentContainer>
  )
}
