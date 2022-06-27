import { useMutation, useQuery } from '@apollo/client'
import { Box } from 'grommet'
import moment from 'moment'
import { useState } from 'react'

import { extendConnection, removeConnection, updateCache } from '../../utils/graphql'

import { Placeholder } from '../accounts/Audits'
import { inviteLink } from '../accounts/CreateInvite'
import { DELETE_INVITE, INVITES_Q } from '../accounts/queries'
import { DeleteIcon } from '../profile/Icon'
import { Copyable } from '../utils/Copyable'
import { StandardScroller } from '../utils/SmoothScroller'
import { Table, TableData, TableRow } from '../utils/Table'

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
      <DeleteIcon
        onClick={() => setConfirm(true)}
        size={25}
      />
      <Confirm
        open={confirm}
        close={() => setConfirm(false)}
        title="Delete Invite?"
        text="You can always recreate it if you want"
        submit={mutation}
        loading={loading}
        error={error}
      />
    </>
  )
}

export function Invites() {
  const [listRef, setListRef] = useState(null)
  const { data, loading, fetchMore } = useQuery(INVITES_Q)

  if (!data) return null

  const { invites: { pageInfo, edges } } = data

  return (
    <Box fill>
      <Table
        headers={['Email', 'Link', 'Created On']}
        sizes={['33%', '33%', '33%']}
        background="fill-one"
        border="1px solid border"
        width="100%"
        height="100%"
      >
        <Box fill>
          <StandardScroller
            listRef={listRef}
            setListRef={setListRef}
            hasNextPage={pageInfo.hasNextPage}
            items={edges}
            loading={loading}
            placeholder={Placeholder}
            mapper={({ node }, { next }) => (
              <TableRow
                last={!next.node}
                suffix={<DeleteInvite invite={node} />}
              >
                <TableData>{node.email}</TableData>
                <TableData><Copyable
                  text={inviteLink(node)}
                  pillText="Copied invite link"
                />
                </TableData>
                <TableData>{moment(node.timestamp).format('lll')}</TableData>
              </TableRow>
            )}
            loadNextPage={() => pageInfo.hasNextPage && fetchMore({
              variables: { cursor: pageInfo.endCursor },
              updateQuery: (prev, { fetchMoreResult: { invites } }) => extendConnection(prev, invites, 'invites'),
            })}
          />
        </Box>
      </Table>
    </Box>
  )
}
