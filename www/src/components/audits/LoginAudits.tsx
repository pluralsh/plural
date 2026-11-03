import { memo, useCallback, useMemo } from 'react'
import { Date, Flex, IconFrame, Table } from '@pluralsh/design-system'
import { createColumnHelper } from '@tanstack/react-table'
import isEmpty from 'lodash/isEmpty'

import { extendConnection, mapExistingNodes } from '../../utils/graphql'
import LoadingIndicator from '../utils/LoadingIndicator'
import { Body2P } from '../utils/Typography'
import { SubpageHeader } from '../utils/layout/SubpageLayout'

import { useLoginsQuery } from '../../generated/graphql'

import { AuditUser } from './AuditUser'
import { Location } from './Location'

const FETCH_MARGIN = 30

const COLUMN_HELPER = createColumnHelper<any>()

const columns = [
  COLUMN_HELPER.accessor((login) => login.user, {
    id: 'user',
    cell: (user: any) => <AuditUser user={user.getValue()} />,
    header: 'User',
  }),
  COLUMN_HELPER.accessor((login) => login.insertedAt, {
    id: 'insertedAt',
    cell: (insertedAt: any) => <Date date={insertedAt.getValue()} />,
    header: 'Event time',
  }),
  COLUMN_HELPER.accessor((login) => login.owner, {
    id: 'owner',
    cell: (owner: any) => <AuditUser user={owner.getValue()} />,
    header: 'Owner',
  }),
  COLUMN_HELPER.accessor((login) => login.repository, {
    id: 'repo',
    cell: (repository: any) => {
      const repo = repository.getValue()
      const icon = repo?.darkIcon || repo?.icon

      return (
        <Flex
          gap="xsmall"
          align="center"
        >
          {icon && (
            <IconFrame
              size="small"
              icon={
                <img
                  src={icon}
                  width="24px"
                  height="24px"
                />
              }
            />
          )}
          {repo?.name}
        </Flex>
      )
    },
    header: 'Repository',
  }),
  COLUMN_HELPER.accessor((login) => login, {
    id: 'locationIp',
    cell: (login: any) => {
      const { ip, country, city } = login.getValue()

      return (
        <Location
          ip={ip}
          country={country}
          city={city}
        />
      )
    },
    header: 'Location / IP',
  }),
]

const LoginAuditsTable = memo(({ logins, fetchMoreOnBottomReached }: any) =>
  !isEmpty(logins) ? (
    <Table
      data={logins}
      columns={columns}
      onScrollCapture={(e) => fetchMoreOnBottomReached(e?.target)}
      virtualizeRows
      maxHeight="calc(100vh - 244px)"
    />
  ) : (
    <Body2P>You do not have any user logins yet.</Body2P>
  )
)

export function LoginAudits() {
  const { data, loading, fetchMore } = useLoginsQuery({
    fetchPolicy: 'cache-and-network',
  })
  const pageInfo = data?.oidcLogins?.pageInfo
  const logins = useMemo(
    () => mapExistingNodes(data?.oidcLogins) || [],
    [data?.oidcLogins]
  )

  const fetchMoreOnBottomReached = useCallback(
    (element?: HTMLDivElement | undefined) => {
      if (!element) return

      const { scrollHeight, scrollTop, clientHeight } = element

      // Once scrolled within FETCH_MARGIN of the bottom of the table, fetch more data if there is any.
      if (
        scrollHeight - scrollTop - clientHeight < FETCH_MARGIN &&
        !loading &&
        pageInfo?.hasNextPage
      ) {
        fetchMore({
          variables: { cursor: pageInfo?.endCursor },
          updateQuery: (prev, { fetchMoreResult: { oidcLogins } }) =>
            extendConnection(prev, oidcLogins, 'oidcLogins'),
        })
      }
    },
    [fetchMore, loading, pageInfo]
  )

  if (!data) return <LoadingIndicator />

  return (
    <Flex
      direction="column"
      width="100%"
      height="100%"
    >
      <SubpageHeader title="Logins" />
      <LoginAuditsTable
        logins={logins}
        fetchMoreOnBottomReached={fetchMoreOnBottomReached}
      />
    </Flex>
  )
}
