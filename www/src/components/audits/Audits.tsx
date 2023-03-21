import { memo, useCallback, useMemo } from 'react'
import { Box } from 'grommet'
import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { A, Div } from 'honorable'
import { Date, PageTitle, Table } from '@pluralsh/design-system'
import { createColumnHelper } from '@tanstack/react-table'
import isEmpty from 'lodash/isEmpty'

import { extendConnection } from '../../utils/graphql'
import { AUDITS_Q } from '../account/queries'
import LoadingIndicator from '../utils/LoadingIndicator'

import { AuditUser } from './AuditUser'
import { Location } from './Location'

const FETCH_MARGIN = 30

const COLUMN_HELPER = createColumnHelper<any>()

const columns = [
  COLUMN_HELPER.accessor(audit => audit, {
    id: 'action',
    cell: (audit: any) => {
      const a = audit.getValue()
      const { link, text } = resourceInfo(a)

      return (
        <>
          {link && (
            <A
              inline
              as={Link}
              to={link}
            >
              {text}
            </A>
          )}
          <Div
            caption
            color="text-xlight"
          >
            {a.action}
          </Div>
        </>
      )
    },
    header: 'Package / Action',
  }),
  COLUMN_HELPER.accessor(audit => audit.actor, {
    id: 'actor',
    cell: (actor: any) => <AuditUser user={actor.getValue()} />,
    header: 'Actor',
  }),
  COLUMN_HELPER.accessor(audit => audit.insertedAt, {
    id: 'insertedAt',
    cell: (insertedAt: any) => <Date date={insertedAt.getValue()} />,
    header: 'Event time',
  }),
  COLUMN_HELPER.accessor(audit => audit, {
    id: 'locationIp',
    cell: (audit: any) => {
      const { ip, country, city } = audit.getValue()

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

const versionLink = ({ chart, terraform }) => (chart ? `/charts/${chart.id}` : `/terraform/${terraform.id}`)

function resourceInfo({
  version, group, role, integrationWebhook, repository, image,
}: any) {
  if (version) {
    return ({
      link: versionLink(version),
      text: `Version{${version.chart ? version.chart.name : version.terraform.name}:${version.version}}`,
    })
  }

  if (group) return { link: '/accounts/edit/groups', text: `Group{${group.name}}` }
  if (role) return { link: '/accounts/edit/roles', text: `Role{${role.name}}` }
  if (integrationWebhook) return { link: `/webhooks/${integrationWebhook.id}`, text: `Webhook{${integrationWebhook.name}}` }
  if (image) {
    return ({
      link: `/dkr/img/${image.id}`,
      text: `Docker{${image.dockerRepository.name}:${image.tag}}`,
    })
  }

  if (repository) return { link: `/repository/${repository.name}`, text: `Repository{${repository.name}}` }

  return { link: null, text: '' }
}

const AuditsTable = memo(({ audits, fetchMoreOnBottomReached }: any) => (!isEmpty(audits)
  ? (
    <Table
      data={audits}
      columns={columns}
      onScrollCapture={e => fetchMoreOnBottomReached(e?.target)}
      virtualizeRows
      maxHeight="calc(100vh - 244px)"
    />
  ) : <>You do not have any audit logs yet.</>))

export function Audits() {
  const { data, loading, fetchMore } = useQuery(AUDITS_Q, { fetchPolicy: 'cache-and-network' })
  const pageInfo = data?.audits?.pageInfo
  const edges = data?.audits?.edges
  const audits = useMemo(() => edges?.map(({ node }) => node) || [], [edges])

  const fetchMoreOnBottomReached = useCallback((element?: HTMLDivElement | undefined) => {
    if (!element) return

    const { scrollHeight, scrollTop, clientHeight } = element

        // Once scrolled within FETCH_MARGIN of the bottom of the table, fetch more data if there is any.
    if (scrollHeight - scrollTop - clientHeight < FETCH_MARGIN && !loading && pageInfo.hasNextPage) {
      fetchMore({
        variables: { cursor: pageInfo.endCursor },
        updateQuery: (prev, { fetchMoreResult: { audits } }) => extendConnection(prev, audits, 'audits'),
      })
    }
  }, [fetchMore, loading, pageInfo])

  if (!data) return <LoadingIndicator />

  return (
    <Box fill>
      <PageTitle heading="Audit logs" />
      <AuditsTable
        audits={audits}
        fetchMoreOnBottomReached={fetchMoreOnBottomReached}
      />
    </Box>
  )
}
