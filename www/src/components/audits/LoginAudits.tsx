import { useQuery } from '@apollo/client'
import { Box } from 'grommet'
import { memo, useCallback, useMemo } from 'react'
import {
  Date,
  IconFrame,
  PageTitle,
  Table,
} from '@pluralsh/design-system'
import { createColumnHelper } from '@tanstack/react-table'
import isEmpty from 'lodash/isEmpty'
import { Flex } from 'honorable'

import { extendConnection } from '../../utils/graphql'
import LoadingIndicator from '../utils/LoadingIndicator'

import { AuditUser } from './AuditUser'
import { Location } from './Location'
import { LOGINS_Q } from './queries'

const FETCH_MARGIN = 30

const COLUMN_HELPER = createColumnHelper<any>()

const columns = [
  COLUMN_HELPER.accessor(login => login.user, {
    id: 'user',
    cell: (user: any) => (<AuditUser user={user.getValue()} />),
    header: 'User',
  }),
  COLUMN_HELPER.accessor(login => login.insertedAt, {
    id: 'insertedAt',
    cell: (insertedAt: any) => <Date date={insertedAt.getValue()} />,
    header: 'Event time',
  }),
  COLUMN_HELPER.accessor(login => login.owner, {
    id: 'owner',
    cell: (owner: any) => <AuditUser user={owner.getValue()} />,
    header: 'Owner',
  }),
  COLUMN_HELPER.accessor(login => login, {
    id: 'repo',
    cell: (login: any) => (
      <Flex gap="xsmall">
        <IconFrame
          size="small"
          icon={(
            <img
              src={login.getValue().repository?.darkIcon || login.getValue().repository?.icon}
              width="24px"
              height="24px"
            />
          )}
        />{login.getValue().repository.name}
      </Flex>
    ),
    header: 'Repository',
  }),
  COLUMN_HELPER.accessor(login => login, {
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

const LoginAuditsTable = memo(({ logins, fetchMoreOnBottomReached }: any) => (!isEmpty(logins)
  ? (
    <Table
      data={logins}
      columns={columns}
      onScrollCapture={e => fetchMoreOnBottomReached(e?.target)}
      virtualizeRows
      maxHeight="calc(100vh - 244px)"
    />
  ) : <>You do not have any user logins yet.</>))

export function LoginAudits() {
  const { data, loading, fetchMore } = useQuery(LOGINS_Q, { fetchPolicy: 'cache-and-network' })
  const pageInfo = data?.oidcLogins?.pageInfo
  const edges = data?.oidcLogins?.edges
  const logins = useMemo(() => edges?.map(({ node }) => node) || [], [edges])

  const fetchMoreOnBottomReached = useCallback((element?: HTMLDivElement | undefined) => {
    if (!element) return

    const { scrollHeight, scrollTop, clientHeight } = element

        // Once scrolled within FETCH_MARGIN of the bottom of the table, fetch more data if there is any.
    if (scrollHeight - scrollTop - clientHeight < FETCH_MARGIN && !loading && pageInfo.hasNextPage) {
      fetchMore({
        variables: { cursor: pageInfo.endCursor },
        updateQuery: (prev, { fetchMoreResult: { oidcLogins } }) => extendConnection(prev, oidcLogins, 'oidcLogins'),
      })
    }
  }, [fetchMore, loading, pageInfo])

  if (!data) return <LoadingIndicator />

  return (
    <Box fill>
      <PageTitle heading="Logins" />
      <LoginAuditsTable
        logins={logins}
        fetchMoreOnBottomReached={fetchMoreOnBottomReached}
      />
    </Box>
  )
}
