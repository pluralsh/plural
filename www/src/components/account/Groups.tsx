import { Button, Flex, SearchIcon, Table } from '@pluralsh/design-system'
import { useContext, useDeferredValue, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CurrentUserContext from '../../contexts/CurrentUserContext'
import SubscriptionContext from '../../contexts/SubscriptionContext'
import { Permission, useGroupsQuery } from '../../generated/graphql'
import { canEdit } from '../../utils/account'
import { mapExistingNodes } from '../../utils/graphql'
import { GqlError } from '../utils/Alert'
import ListInput from '../utils/ListInput'
import { SubpageHeader } from '../utils/layout/SubpageLayout'
import { useFetchPaginatedData } from '../utils/useFetchPaginatedData'

import BillingFeatureBlockModal from './billing/BillingFeatureBlockModal'
import BillingLegacyUserBanner from './billing/BillingLegacyUserBanner'
import BillingTrialBanner from './billing/BillingTrialBanner'
import {
  GroupMembersExpand,
  GroupsListMeta,
  groupsCols,
} from './groups/GroupsColumns'
import { membershipExpandTableProps } from './groups/MembershipExpandPanel'
import { hasRbac } from './utils'
import { SAMPLE_GROUP_ROWS, UpgradeGate } from './UpgradeGate'

export const GROUP_CREATE_PATH = '/account/groups/create'

export function useCanEditGroups() {
  const me = useContext(CurrentUserContext)

  return canEdit(me, me.account) || hasRbac(me, Permission.Users)
}

function GroupsList() {
  const navigate = useNavigate()
  const editable = useCanEditGroups()
  const [q, setQ] = useState('')
  const deferredQ = useDeferredValue(q)
  const { data, loading, error, pageInfo, fetchNextPage, setVirtualSlice } =
    useFetchPaginatedData(
      { queryHook: useGroupsQuery, keyPath: ['groups'], pageSize: 20 },
      { q: deferredQ || undefined }
    )
  const groups = useMemo(() => mapExistingNodes(data?.groups), [data?.groups])
  const meta: GroupsListMeta = { editable }

  return (
    <Flex
      direction="column"
      gap="medium"
      flexGrow={1}
      minHeight={0}
    >
      <ListInput
        width="100%"
        value={q}
        placeholder="Search a group"
        startIcon={<SearchIcon color="text-light" />}
        onChange={({ target: { value } }) => setQ(value)}
        flexGrow={0}
      />
      {error ? (
        <GqlError error={error} />
      ) : (
        <Table
          fullHeightWrap
          virtualizeRows
          {...membershipExpandTableProps}
          data={groups}
          loading={!data && loading}
          columns={groupsCols}
          reactTableOptions={{ meta }}
          hasNextPage={pageInfo?.hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={loading}
          onVirtualSliceChange={setVirtualSlice}
          renderExpanded={({ row }) => (
            <GroupMembersExpand
              row={row}
              editable={editable}
            />
          )}
          emptyStateProps={
            deferredQ
              ? { message: `No groups found for ${deferredQ}` }
              : {
                  message: "Looks like you don't have any groups yet.",
                  children: editable && (
                    <Button
                      floating
                      onClick={() => navigate(GROUP_CREATE_PATH)}
                    >
                      Create group
                    </Button>
                  ),
                }
          }
        />
      )}
    </Flex>
  )
}

export function Groups() {
  const navigate = useNavigate()
  const editable = useCanEditGroups()
  const { availableFeatures } = useContext(SubscriptionContext)
  const isAvailable = !!availableFeatures?.userManagement
  const [blockModalVisible, setBlockModalVisible] = useState(false)

  return (
    <Flex
      flexGrow={1}
      flexDirection="column"
      maxHeight="100%"
    >
      <SubpageHeader title="Groups">
        {editable && (
          <Button
            secondary
            onClick={() =>
              isAvailable
                ? navigate(GROUP_CREATE_PATH)
                : setBlockModalVisible(true)
            }
          >
            Create group
          </Button>
        )}
      </SubpageHeader>
      <BillingLegacyUserBanner feature="groups" />
      <BillingTrialBanner />
      {isAvailable ? (
        <GroupsList />
      ) : (
        <UpgradeGate
          feature="groups"
          description="Organize your users into groups to more easily apply permissions to sub-sections of your team. e.g. ops, end-users, and admins."
          searchPlaceholder="Search a group"
          rows={SAMPLE_GROUP_ROWS}
        />
      )}
      <BillingFeatureBlockModal
        open={blockModalVisible}
        message="Upgrade to Plural Pro to create a group."
        onClose={() => setBlockModalVisible(false)}
      />
    </Flex>
  )
}
