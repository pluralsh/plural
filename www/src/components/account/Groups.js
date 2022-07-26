import { useMutation, useQuery } from '@apollo/client'
import { Box } from 'grommet'
import { Button, GlobeIcon, Input, Modal, ModalHeader, SearchIcon } from 'pluralsh-design-system'
import { useContext, useState } from 'react'

import { extendConnection, removeConnection, updateCache } from '../../utils/graphql'
import { Placeholder } from '../accounts/Audits'
import { canEdit } from '../accounts/EditAccount'
import { DELETE_GROUP, GROUPS_Q } from '../accounts/queries'
import { Permissions } from '../accounts/types'
import { CurrentUserContext } from '../login/CurrentUser'
import { DeleteIcon } from '../profile/Icon'
import { ListItem } from '../profile/ListItem'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { Container } from '../utils/Container'
import { StandardScroller } from '../utils/SmoothScroller'

import { Confirm } from './Confirm'
import { CreateGroup, UpdateGroup, ViewGroup } from './Group'

import { Info } from './Info'
import { hasRbac } from './utils'

function Header({ q, setQ }) {
  return (
    <Box
      direction="row"
      align="center"
      gap="medium"
    >
      <Box fill="horizontal">
        <Input
          width="50%"
          value={q}
          placeholder="Search for groups by name"
          startIcon={<SearchIcon size={15} />}
          onChange={({ target: { value } }) => setQ(value)}
        />
      </Box>
      <Box
        flex={false}
        align="center"
        direction="row"
        gap="medium"
      >
        <CreateGroup q={q} />
      </Box>
    </Box>
  )
}

function Group({ group, q }) {
  const { account, ...me } = useContext(CurrentUserContext)
  const editable = canEdit(me, account) || hasRbac(me, Permissions.USERS)
  const [edit, setEdit] = useState(false)
  const [view, setView] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [mutation, { loading, error }] = useMutation(DELETE_GROUP, {
    variables: { id: group.id },
    onCompleted: () => setConfirm(false),
    update: (cache, { data: { deleteGroup } }) => updateCache(cache, {
      query: GROUPS_Q,
      variables: { q },
      update: prev => removeConnection(prev, deleteGroup, 'groups'),
    }),
  })

  return (
    <Box
      fill="horizontal"
      direction="row"
      align="center"
    >
      <Info
        text={group.name}
        description={group.description || 'no description'}
      />
      <>
        <Box
          flex={false}
          direction="row"
          gap="24px"
          align="center"
        >
          {group.global && <GlobeIcon size={20} />}
          {!editable && (
            <Button
              secondary
              small
              onClick={() => setView(true)}
            >View
            </Button>
          )}
          {editable && (
            <Button
              secondary
              small
              onClick={() => setEdit(true)}
            >Edit
            </Button>
          )}
          {editable && <DeleteIcon onClick={() => setConfirm(true)} />}
        </Box>
        <Modal
          open={view}
          width="60vw"
          onClose={() => setView(false)}
        >
          <ModalHeader onClose={() => setView(false)}>
            VIEW GROUP
          </ModalHeader>
          <ViewGroup group={group} />
        </Modal>
        <Modal
          portal
          open={edit}
          width="60vw"
          onClose={() => setEdit(false)}
        >
          <ModalHeader onClose={() => setEdit(false)}>
            EDIT GROUP
          </ModalHeader>
          <UpdateGroup
            group={group}
            cancel={() => setEdit(false)}
          />
        </Modal>
        <Confirm
          open={confirm}
          text="Deleting groups cannot be undone and permissions attached to this group will be removed."
          close={() => setConfirm(false)}
          submit={mutation}
          loading={loading}
          destructive
          error={error}
        />
      </>
    </Box>
  )
}

function GroupsInner({ q }) {
  const [listRef, setListRef] = useState(null)
  const { data, loading, fetchMore } = useQuery(GROUPS_Q, { variables: { q } })

  if (!data) return <LoopingLogo />

  const { edges, pageInfo } = data.groups

  return (
    <Box
      fill
      pad={{ bottom: 'small' }}
    >
      <StandardScroller
        listRef={listRef}
        setListRef={setListRef}
        items={edges}
        mapper={({ node: group }, { prev, next }) => (
          <ListItem
            first={!prev.node}
            last={!next.node}
          >
            <Group
              group={group}
              q={q}
            />
          </ListItem>
        )}
        loadNextPage={() => pageInfo.hasNextPage && fetchMore({
          variables: { cursor: pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult: { groups } }) => extendConnection(prev, groups, 'groups'),
        })}
        hasNextPage={pageInfo.hasNextPage}
        loading={loading}
        placeholder={Placeholder}
      />
    </Box>
  )
}

export function Groups() {
  const [q, setQ] = useState('')

  return (
    <Container type="table">
      <Box
        fill
        gap="medium"
      >
        <Header
          q={q}
          setQ={setQ}
        />
        <GroupsInner q={q} />
      </Box>
    </Container>
  )
}
