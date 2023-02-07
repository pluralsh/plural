import { Flex } from 'honorable'
import {
  Button,
  GearTrainIcon,
  GlobeIcon,
  IconFrame,
  Modal,
  PageTitle,
  PeopleIcon,
  SearchIcon,
} from '@pluralsh/design-system'
import { useContext, useState } from 'react'

import CurrentUserContext from '../../contexts/CurrentUserContext'
import { Group as GroupT, GroupsDocument, useDeleteGroupMutation } from '../../generated/graphql'
import { removeConnection, updateCache } from '../../utils/graphql'

import ListInput from '../utils/ListInput'
import { List } from '../utils/List'
import { DeleteIconButton } from '../utils/IconButtons'
import { canEdit } from '../users/EditAccount'

import { Permissions } from './types'
import { Confirm } from './Confirm'
import { ViewGroup } from './Group'
import { CreateGroup } from './CreateGroup'
import { EditGroupAttributes, EditGroupMembers } from './EditGroup'
import { Info } from './Info'
import { hasRbac } from './utils'
import { GroupsList } from './GroupsList'

function Header({ q, setQ }: any) {
  return (
    <ListInput
      width="100%"
      value={q}
      placeholder="Search a group"
      startIcon={<SearchIcon color="text-light" />}
      onChange={({ target: { value } }) => setQ(value)}
      flexGrow={0}
    />
  )
}

export function Group({ group, q }: { group: GroupT; q: any }) {
  const {
    me: { account, ...me },
  } = useContext(CurrentUserContext)
  const editable = canEdit(me, account) || hasRbac(me, Permissions.USERS)
  const [dialogKey, setDialogKey] = useState<
    'confirmDelete' | 'editAttrs' | 'editMembers' | 'viewGroup' | ''
  >('')
  const [mutation, { loading, error }] = useDeleteGroupMutation({
    variables: { id: group.id },
    onCompleted: () => dialogKey === 'confirmDelete' && setDialogKey(''),
    update: (cache, { data }) => updateCache(cache, {
      query: GroupsDocument,
      variables: { q },
      update: prev => removeConnection(prev, data?.deleteGroup, 'groups'),
    }),
  })

  return (
    <Flex
      direction="row"
      align="center"
    >
      <Info
        text={group.name}
        description={group.description || 'no description'}
      />
      <>
        <Flex
          flex={false}
          direction="row"
          gap="large"
          align="center"
        >
          {group.global && <GlobeIcon size={20} />}
          {!editable && (
            <Button
              secondary
              small
              onClick={() => dialogKey === '' && setDialogKey('viewGroup')}
            >
              View
            </Button>
          )}
          <Flex gap="xsmall">
            {editable && (
              <>
                <IconFrame
                  clickable
                  size="medium"
                  onClick={() => dialogKey === '' && setDialogKey('editAttrs')}
                  tooltip="Edit attributes"
                  icon={<GearTrainIcon />}
                />
                <IconFrame
                  clickable
                  size="medium"
                  onClick={() => dialogKey === '' && setDialogKey('editMembers')}
                  tooltip="Edit members"
                  icon={<PeopleIcon />}
                />
              </>
            )}
            {editable && (
              <DeleteIconButton
                onClick={() => dialogKey === '' && setDialogKey('confirmDelete')}
              />
            )}
          </Flex>
        </Flex>
        <Modal
          portal
          header="View group"
          open={dialogKey === 'viewGroup'}
          onClose={() => dialogKey === 'viewGroup' && setDialogKey('')}
        >
          <ViewGroup group={group} />
        </Modal>
        <EditGroupAttributes
          group={group}
          open={dialogKey === 'editAttrs'}
          onClose={() => dialogKey === 'editAttrs' && setDialogKey('')}
        />
        <EditGroupMembers
          group={group}
          open={dialogKey === 'editMembers'}
          onClose={() => dialogKey === 'editMembers' && setDialogKey('')}
        />
        <Confirm
          open={dialogKey === 'confirmDelete'}
          text="Deleting groups cannot be undone and permissions attached to this group will be removed."
          close={() => dialogKey === 'confirmDelete' && setDialogKey('')}
          submit={() => mutation()}
          loading={loading}
          destructive
          error={error}
        />
      </>
    </Flex>
  )
}

export function Groups() {
  const [q, setQ] = useState('')

  return (
    <Flex
      flexGrow={1}
      flexDirection="column"
      maxHeight="100%"
    >
      <PageTitle heading="Groups">
        <CreateGroup q={q} />
      </PageTitle>
      <List>
        <Header
          q={q}
          setQ={setQ}
        />
        <GroupsList q={q} />
      </List>
    </Flex>
  )
}
