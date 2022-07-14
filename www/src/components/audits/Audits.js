import { useCallback, useState } from 'react'
import { Box } from 'grommet'
import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'

import { A } from 'honorable'

import { extendConnection } from '../../utils/graphql'
import { StandardScroller } from '../utils/SmoothScroller'
import { LoopingLogo } from '../utils/AnimatedLogo'

import { ReturnToBeginning } from '../utils/ReturnToBeginning'

import { Table, TableData, TableRow } from '../utils/Table'

import { AUDITS_Q } from '../accounts/queries'

import { AuditUser } from './AuditUser'
import { Location } from './Location'
import { Date } from './Date'

const versionLink = ({ chart, terraform }) => chart ? `/charts/${chart.id}` : `/terraform/${terraform.id}`

function resourceInfo({ version, group, role, integrationWebhook, repository, image }) {
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

  if (repository) return { link: `/repositories/${repository.id}`, text: `Repository{${repository.name}}` }

  return { link: null, text: '' }
}

function Resource({ audit }) {
  const { link, text } = resourceInfo(audit)
  if (!link) return null

  return (
    <A
      inline
      as={Link}
      to={link}
    >
      {text}
    </A>
  )
}

export function Placeholder() {
  return (
    <Box
      flex={false}
      height="50px"
      pad="small"
    />
  )
}

function Audit({ audit, last }) {
  return (
    <TableRow last={last}>
      <TableData>{audit.action}</TableData>
      <TableData>{audit.actor && <AuditUser user={audit.actor} />}</TableData>
      <TableData><Resource audit={audit} /></TableData>
      <TableData><Date date={audit.insertedAt} /></TableData>
      <TableData>
        <Location
          ip={audit.ip}
          country={audit.country}
          city={audit.city}
        />
      </TableData>
    </TableRow>
  )
}

export function Audits() {
  const [listRef, setListRef] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const { data, loading, fetchMore } = useQuery(AUDITS_Q, { fetchPolicy: 'cache-and-network' })

  const returnToBeginning = useCallback(() => {
    listRef.scrollToItem(0)
  }, [listRef])

  if (!data) {
    return (
      <LoopingLogo />
    )
  }

  const { edges, pageInfo } = data.audits

  return (
    <Box
      fill
    >
      <Table
        headers={['Action', 'Actor', 'Resource', 'Event Time', 'Location']}
        sizes={['20%', '20%', '20%', '20%', '20%']}
        width="100%"
        height="100%"
        background="fill-one"
        border="1px solid border"
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
            mapper={({ node: audit }, { next }) => (
              <Audit
                last={!next.node}
                key={audit.id}
                audit={audit}
              />
            )}
            loadNextPage={() => pageInfo.hasNextPage && fetchMore({
              variables: { cursor: pageInfo.endCursor },
              updateQuery: (prev, { fetchMoreResult: { audits } }) => extendConnection(prev, audits, 'audits'),
            })}
          />
        </Box>
      </Table>
    </Box>
  )
}
