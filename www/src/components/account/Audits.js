import { useCallback, useState } from 'react'
import moment from 'moment'
import { Box, Text } from 'grommet'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import lookup from 'country-code-lookup'

import { Div, Flex, Span } from 'honorable'

import { Tab } from 'pluralsh-design-system'

import { extendConnection } from '../../utils/graphql'
import { StandardScroller } from '../utils/SmoothScroller'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { formatLocation } from '../../utils/geo'
import { Chloropleth } from '../utils/Chloropleth'

import { RepoIcon } from '../repos/Repositories'

import Avatar from '../users/Avatar'
import { ReturnToBeginning } from '../utils/ReturnToBeginning'

import { SidebarTabs } from '../utils/SidebarTabs'

import { Table, TableData, TableRow } from '../utils/Table'

import { AUDITS_Q, AUDIT_METRICS, LOGINS_Q, LOGIN_METRICS } from '../accounts/queries'
import { ButtonGroup } from '../utils/ButtonGroup'

function AuditUser({ user }) {
  return (
    <Box
      flex={false}
      direction="row"
      gap="xsmall"
      align="center"
    >
      <Avatar
        user={user}
        size="24px"
      />
      <Text size="small">{user.name}</Text>
    </Box>
  )
}

function LoginRow({ login, last }) {
  return (
    <TableRow last={last}>
      <TableData>
        <AuditUser
          user={login.user}
          width="20%"
        />
      </TableData>
      <TableData>
        {moment(login.insertedAt).format('lll')}
      </TableData>
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

  return <Link to={link}>{text}</Link>
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

function Location({ ip, city, country }) {
  if (!ip) return null

  return (
    <Box>
      {country && (
        <Span
          fontWeight="bold"
          color="white"
        >{formatLocation(country, city)}
        </Span>
      )}
      <Span color="text-light">{ip}</Span>
    </Box>
  )
}

function Audit({ audit, last }) {
  return (
    <TableRow last={last}>
      <TableData>{audit.action}</TableData>
      <TableData>
        {audit.actor && <AuditUser user={audit.actor} />}
            
      </TableData>
      <TableData>
        <Resource audit={audit} />
      </TableData>
      <TableData>
        {moment(audit.insertedAt).format('lll')}
      </TableData>
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

export function AuditChloro() {
  const [tab, setTab] = useState('Audits')
  const { data } = useQuery(tab === 'Logins' ? LOGIN_METRICS : AUDIT_METRICS, { fetchPolicy: 'cache-and-network' })

  if (!data) return null

  const results = data.auditMetrics || data.loginMetrics
  const metrics = results.map(({ country, count }) => ({
    id: lookup.byIso(country).iso3, value: count,
  }))

  return (
    <Box
      fill
      gap="medium"
    >
      <Div width="150px">
        <ButtonGroup
          tabs={['Audits', 'Logins']}
          default="Audits"
          onChange={setTab}
        />
      </Div>
      <Box
        fill
        background="fill-one"
      >
        <Chloropleth data={metrics} />
      </Box>
    </Box>
   
  )
}

export function LoginAudits() {
  const [listRef, setListRef] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const { data, loading, fetchMore } = useQuery(LOGINS_Q, { fetchPolicy: 'cache-and-network' })
  const returnToBeginning = useCallback(() => {
    listRef.scrollToItem(0)
  }, [listRef])

  console.log(data)

  if (!data) {
    return (
      <LoopingLogo />
    )
  }

  const { edges, pageInfo } = data.oidcLogins

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

const DIRECTORY = [
  { path: '/audits/logs', label: 'Audit Logs' },
  { path: '/audits/logins', label: 'Logins' },
  { path: '/audits/geo', label: 'Geodistribution' },
]

export function AuditDirectory() {
  const { pathname } = useLocation()

  return (
    <Flex
      height="100%"
      width="100%"
      overflowY="hidden"
    >
      <SidebarTabs width={300}>
        {DIRECTORY.map(({ label, path }) => (
          <Link
            to={path}
            style={{ textDecoration: 'none' }}
          >
            <Tab
              active={pathname === path}
              vertical
              textDecoration="none"
            >{label}
            </Tab>
          </Link>
        ))}
      </SidebarTabs>
      <Div
        flexGrow={1}
        py={1.5}
        pr={1.5}
        height="100%"
        maxHeight="100%"
        overflowY="auto"
      >
        <Outlet />
      </Div>
    </Flex>
  )
}
