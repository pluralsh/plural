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
import { Flex } from 'honorable'
import { useContext, useState } from 'react'

import CurrentUserContext from '../../contexts/CurrentUserContext'
import SubscriptionContext from '../../contexts/SubscriptionContext'
import {
  Group as GroupT,
  GroupsDocument,
  Permission,
  useDeleteGroupMutation,
} from '../../generated/graphql'
import { canEdit } from '../../utils/account'
import { removeConnection, updateCache } from '../../utils/graphql'
import { Confirm } from '../utils/Confirm'
import { DeleteIconButton } from '../utils/IconButtons'
import { List } from '../utils/List'
import ListInput from '../utils/ListInput'

import BillingFeatureBlockBanner from './billing/BillingFeatureBlockBanner'
import BillingLegacyUserBanner from './billing/BillingLegacyUserBanner'
import BillingTrialBanner from './billing/BillingTrialBanner'
import { CreateGroup } from './CreateGroup'
import { EditGroupAttributes, EditGroupMembers } from './EditGroup'
import { ViewGroup } from './Group'
import { GroupsList } from './GroupsList'
import { Info } from './Info'
import { hasRbac } from './utils'

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
  const me = useContext(CurrentUserContext)
  const editable = canEdit(me, me.account) || hasRbac(me, Permission.Users)
  const [dialogKey, setDialogKey] = useState<
    'confirmDelete' | 'editAttrs' | 'editMembers' | 'viewGroup' | ''
  >('')
  const [mutation, { loading, error }] = useDeleteGroupMutation({
    variables: { id: group.id },
    onCompleted: () => dialogKey === 'confirmDelete' && setDialogKey(''),
    update: (cache, { data }) =>
      updateCache(cache, {
        query: GroupsDocument,
        variables: { q },
        update: (prev) => removeConnection(prev, data?.deleteGroup, 'groups'),
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
                  onClick={() =>
                    dialogKey === '' && setDialogKey('editMembers')
                  }
                  tooltip="Edit members"
                  icon={<PeopleIcon />}
                />
              </>
            )}
            {editable && (
              <DeleteIconButton
                onClick={() =>
                  dialogKey === '' && setDialogKey('confirmDelete')
                }
              />
            )}
          </Flex>
        </Flex>
        <Modal
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
  const { availableFeatures } = useContext(SubscriptionContext)
  const isAvailable = !!availableFeatures?.userManagement

  return (
    <Flex
      flexGrow={1}
      flexDirection="column"
      maxHeight="100%"
    >
      <PageTitle heading="Groups">
        <CreateGroup q={q} />
      </PageTitle>
      <BillingLegacyUserBanner feature="groups" />
      <BillingTrialBanner />
      {isAvailable ? (
        <List>
          <Header
            q={q}
            setQ={setQ}
          />
          <GroupsList q={q} />
        </List>
      ) : (
        <BillingFeatureBlockBanner
          feature="groups"
          description="Organize your users into groups to more easily apply permissions to sub-sections of your team. e.g. ops, end-users, and admins."
          placeholderImageURL="/placeholders/groups.png"
        />
      )}
    </Flex>
  )
}
