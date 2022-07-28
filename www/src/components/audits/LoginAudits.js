import { useQuery } from '@apollo/client'
import { Box, Text } from 'grommet'
import { useCallback, useState } from 'react'

import { Placeholder } from '../accounts/Audits'

import { RepoIcon } from '../repos/Repositories'

import { LoopingLogo } from '../utils/AnimatedLogo'
import { ReturnToBeginning } from '../utils/ReturnToBeginning'
import { StandardScroller } from '../utils/SmoothScroller'
import { Table, TableData, TableRow } from '../utils/Table'

import { extendConnection } from '../../utils/graphql'

import { Date } from '../utils/Date'

import { AuditUser } from './AuditUser'
import { Location } from './Location'

import { LOGINS_Q } from './queries'

function LoginRow({ login, last }) {
  return (
    <TableRow last={last}>
      <TableData>
        <AuditUser
          user={login.user}
          width="20%"
        />
      </TableData>
      <TableData><Date date={login.insertedAt} /></TableData>
      <TableData>
        <AuditUser user={login.owner} />
      </TableData>
      <TableData>
        <Box
          flex={false}
          direction="row"
          gap="xsmall"
          align="center"
        >
          <RepoIcon
            repo={login.repository}
            size="24px"
          />
          <Text size="small">{login.repository.name}</Text>
        </Box>
      </TableData>
      <TableData>
        <Location
          ip={login.ip}
          country={login.country}
          city={login.city}
        />
      </TableData>
    </TableRow>
  )
}

export function LoginAudits() {
  const [listRef, setListRef] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const { data, loading, fetchMore } = useQuery(LOGINS_Q, { fetchPolicy: 'cache-and-network' })
  const returnToBeginning = useCallback(() => {
    listRef.scrollToItem(0)
  }, [listRef])

  if (!data) {
    return (
      <LoopingLogo />
    )
  }

  const { edges, pageInfo } = data.oidcLogins

  console.log(edges)

  return (
    <Box fill>
      <Table
        headers={['User', 'Event Time', 'Owner', 'Repository', 'Location']}
        sizes={['20%', '20%', '20%', '20%', '20%']}
        background="fill-one"
        border="1px solid border"
        width="100%"
        height="100%"
      >
        <Box fill>
          {scrolled && <ReturnToBeginning beginning={returnToBeginning} />}
          <StandardScroller
            listRef={listRef}
            setListRef={setListRef}
            hasNextPage={pageInfo.hasNextPage}
            items={edges}
            loading={loading}
            handleScroll={setScrolled}
            placeholder={Placeholder}
            mapper={({ node }, { next }) => (
              <LoginRow
                key={node.id}
                login={node}
                last={!next.node}
              />
            )}
            loadNextPage={() => pageInfo.hasNextPage && fetchMore({
              variables: { cursor: pageInfo.endCursor },
              updateQuery: (prev, { fetchMoreResult: { oidcLogins } }) => extendConnection(prev, oidcLogins, 'oidcLogins'),
            })}
          />
        </Box>
      </Table>
    </Box>
  )
}
