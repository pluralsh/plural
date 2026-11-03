import { memo, useCallback, useMemo } from 'react'
import { Date, Flex, Table } from '@pluralsh/design-system'
import { createColumnHelper } from '@tanstack/react-table'
import isEmpty from 'lodash/isEmpty'

import { extendConnection, mapExistingNodes } from '../../utils/graphql'
import LoadingIndicator from '../utils/LoadingIndicator'
import { Body2P, CaptionP, InlineLinkSC } from '../utils/Typography'
import { SubpageHeader } from '../utils/layout/SubpageLayout'

import { useAuditsQuery } from '../../generated/graphql'

import { AuditUser } from './AuditUser'
import { Location } from './Location'

const FETCH_MARGIN = 30

const COLUMN_HELPER = createColumnHelper<any>()

const columns = [
  COLUMN_HELPER.accessor((audit) => audit, {
    id: 'action',
    cell: (audit: any) => {
      const a = audit.getValue()
      const { link, text } = resourceInfo(a)

      return (
        <>
          {link ? (
            <InlineLinkSC to={link}>{text}</InlineLinkSC>
          ) : (
            text && <span>{text}</span>
          )}
          <CaptionP
            as="div"
            $color="text-xlight"
          >
            {a.action}
          </CaptionP>
        </>
      )
    },
    header: 'Resource / Action',
  }),
  COLUMN_HELPER.accessor((audit) => audit.actor, {
    id: 'actor',
    cell: (actor: any) => <AuditUser user={actor.getValue()} />,
    header: 'Actor',
  }),
  COLUMN_HELPER.accessor((audit) => audit.insertedAt, {
    id: 'insertedAt',
    cell: (insertedAt: any) => <Date date={insertedAt.getValue()} />,
    header: 'Event time',
  }),
  COLUMN_HELPER.accessor((audit) => audit, {
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

function resourceInfo({
  version,
  group,
  role,
  integrationWebhook,
  repository,
  image,
}: any) {
  if (version) {
    return {
      link: null,
      text: `Version{${
        version.chart ? version.chart.name : version.terraform.name
      }:${version.version}}`,
    }
  }

  if (group) return { link: '/account/groups', text: `Group{${group.name}}` }
  if (role) return { link: '/account/roles', text: `Role{${role.name}}` }
  if (integrationWebhook)
    return { link: null, text: `Webhook{${integrationWebhook.name}}` }
  if (image) {
    return {
      link: null,
      text: `Docker{${image.dockerRepository.name}:${image.tag}}`,
    }
  }

  if (repository)
    return {
      link: null,
      text: `Repository{${repository.name}}`,
    }

  return { link: null, text: '' }
}

const AuditsTable = memo(({ audits, fetchMoreOnBottomReached }: any) =>
  !isEmpty(audits) ? (
    <Table
      data={audits}
      columns={columns}
      onScrollCapture={(e) => fetchMoreOnBottomReached(e?.target)}
      virtualizeRows
      maxHeight="calc(100vh - 244px)"
    />
  ) : (
    <Body2P>You do not have any audit logs yet.</Body2P>
  )
)

export function Audits() {
  const { data, loading, fetchMore } = useAuditsQuery({
    fetchPolicy: 'cache-and-network',
  })
  const pageInfo = data?.audits?.pageInfo
  const audits = useMemo(() => mapExistingNodes(data?.audits), [data?.audits])

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
          updateQuery: (prev, { fetchMoreResult: { audits } }) =>
            extendConnection(prev, audits, 'audits'),
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
      <SubpageHeader title="Audit logs" />
      <AuditsTable
        audits={audits}
        fetchMoreOnBottomReached={fetchMoreOnBottomReached}
      />
    </Flex>
  )
}
