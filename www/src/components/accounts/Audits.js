import { useCallback, useContext, useEffect, useState } from 'react'
import moment from 'moment'
import { Box, Text } from 'grommet'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { GraphView, ListView, Oauth } from 'forge-core'
import Toggle from 'react-toggle'
import lookup from 'country-code-lookup'

import { extendConnection } from '../../utils/graphql'
import { BreadcrumbsContext } from '../Breadcrumbs'
import { StandardScroller } from '../utils/SmoothScroller'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { formatLocation } from '../../utils/geo'
import { Chloropleth } from '../utils/Chloropleth'

import { RepoIcon } from '../repos/Repositories'

import Avatar from '../users/Avatar'
import { SectionContentContainer, SectionPortal } from '../Explore'
import { SubmenuItem, SubmenuPortal } from '../navigation/Submenu'
import { ReturnToBeginning } from '../utils/ReturnToBeginning'

import { AUDITS_Q, AUDIT_METRICS, LOGINS_Q, LOGIN_METRICS } from './queries'

function HeaderItem({ text, width, nobold }) {
  return (
    <Box width={width}>
      <Text
        size="small"
        weight={nobold ? null : 500}
      >
        {text}
      </Text>
    </Box>
  )
}

function AuditHeader() {
  return (
    <Box
      flex={false}
      direction="row"
      pad="small"
      gap="xsmall"
      border={{ side: 'bottom' }}
      align="center"
    >
      <HeaderItem
        text="Action"
        width="25%"
      />
      <HeaderItem
        text="Actor"
        width="25%"
      />
      <HeaderItem
        text="Resource"
        width="15%"
      />
      <HeaderItem
        text="Event Time"
        width="15%"
      />
      <HeaderItem
        text="IP"
        width="10%"
      />
      <HeaderItem
        text="Location"
        width="10%"
      />
    </Box>
  )
}

function LoginHeader() {
  return (
    <Box
      flex={false}
      direction="row"
      pad="small"
      gap="xsmall"
      border={{ side: 'bottom' }}
      align="center"
    >
      <HeaderItem
        text="User"
        width="20%"
      />
      <HeaderItem
        text="Event Time"
        width="20%"
      />
      <HeaderItem
        text="Owner"
        width="20%"
      />
      <HeaderItem
        text="Repository"
        width="20%"
      />
      <HeaderItem
        text="IP"
        width="10%"
      />
      <HeaderItem
        text="Location"
        width="10%"
      />
    </Box>
  )
}

function AuditUser({ user, width = '25%' }) {
  return (
    <Box
      flex={false}
      width={width}
      direction="row"
      gap="xsmall"
      align="center"
    >
      <Avatar
        user={user}
        size="30px"
      />
      <Text size="small">{user.name}</Text>
    </Box>
  )
}

function LoginRow({ login }) {
  return (
    <Box
      flex={false}
      direction="row"
      pad={{ horizontal: 'small' }}
      gap="xsmall"
      border={{ side: 'bottom' }}
      align="center"
      onClick={() => null}
      hoverIndicator="fill-one"
      focusIndicator={false}
    >
      <AuditUser
        user={login.user}
        width="20%"
      />
      <HeaderItem
        text={moment(login.insertedAt).format('lll')}
        nobold
        width="20%"
      />
      <AuditUser
        user={login.owner}
        width="20%"
      />
      <Box
        flex={false}
        width="20%"
        direction="row"
        gap="xsmall"
        align="center"
      >
        <RepoIcon repo={login.repository} />
        <Text size="small">{login.repository.name}</Text>
      </Box>
      <HeaderItem
        text={login.ip}
        nobold
        width="10%"
      />
      <HeaderItem
        text={formatLocation(login.country, login.city)}
        nobold
        width="10%"
      />
    </Box>
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

function Audit({ audit }) {
  return (
    <Box
      flex={false}
      direction="row"
      pad="small"
      gap="xsmall"
      border={{ side: 'bottom' }}
      align="center"
      onClick={() => null}
      hoverIndicator="fill-one"
      focusIndicator={false}
    >
      <HeaderItem
        text={audit.action}
        nobold
        width="25%"
      />
      {audit.actor && <AuditUser user={audit.actor} />}
      {!audit.actor && (
        <Box
          flex={false}
          width="25%"
        />
      )}
      <Box width="15%">
        <Resource audit={audit} />
      </Box>
      <HeaderItem
        text={moment(audit.insertedAt).format('lll')}
        nobold
        width="15%"
      />
      <HeaderItem
        text={audit.ip}
        nobold
        width="10%"
      />
      <HeaderItem
        text={formatLocation(audit.country, audit.city)}
        nobold
        width="10%"
      />
    </Box>
  )
}

function AuditChloro() {
  const [login, setLogin] = useState(false)
  const { data } = useQuery(login ? LOGIN_METRICS : AUDIT_METRICS, { fetchPolicy: 'cache-and-network' })

  if (!data) return null

  const results = data.auditMetrics || data.loginMetrics
  const metrics = results.map(({ country, count }) => ({
    id: lookup.byIso(country).iso3, value: count,
  }))

  return (
    <SectionContentContainer header="Geodistribution">
      <Box fill>
        <Chloropleth data={metrics} />
      </Box>
      <SectionPortal>
        <Box
          direction="row"
          align="center"
          gap="small"
        >
          <Toggle
            checked={login}
            onChange={({ target: { checked } }) => setLogin(checked)}
          />
          <Text size="small">{login ? 'Logins' : 'Audits'}</Text>
        </Box>
      </SectionPortal>
    </SectionContentContainer>
  )
}

function LoginAudits() {
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

  return (
    <Box fill>
      <LoginHeader />
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
          mapper={({ node }) => (
            <LoginRow
              key={node.id}
              login={node}
            />
          )}
          loadNextPage={() => pageInfo.hasNextPage && fetchMore({
            variables: { cursor: pageInfo.endCursor },
            updateQuery: (prev, { fetchMoreResult: { oidcLogins } }) => extendConnection(prev, oidcLogins, 'oidcLogins'),
          })}
        />
      </Box>
    </Box>
  )
}

export function Audits() {
  const { graph } = useParams()
  const [listRef, setListRef] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const { data, loading, fetchMore } = useQuery(AUDITS_Q, { fetchPolicy: 'cache-and-network' })
  const { setBreadcrumbs } = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([{ text: 'audits', url: '/audits' }])
  }, [setBreadcrumbs])

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
      direction="row"
      background="background"
    >
      <SubmenuPortal name="audits">
        <SubmenuItem
          icon={<ListView size="14px" />}
          label="Audits"
          selected={graph === 'table'}
          url="/audits/table"
        />
        <SubmenuItem
          icon={<Oauth size="14px" />}
          label="Logins"
          selected={graph === 'logins'}
          url="/audits/logins"
        />
        <SubmenuItem
          icon={<GraphView size="14px" />}
          label="Geodistribution"
          selected={graph === 'graph'}
          url="/audits/graph"
        />
      </SubmenuPortal>
      {graph === 'graph' && <AuditChloro />}
      {graph === 'logins' && <LoginAudits />}
      {graph === 'table' && (
        <Box fill>
          <AuditHeader />
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
              mapper={({ node }) => (
                <Audit
                  key={node.id}
                  audit={node}
                />
              )}
              loadNextPage={() => pageInfo.hasNextPage && fetchMore({
                variables: { cursor: pageInfo.endCursor },
                updateQuery: (prev, { fetchMoreResult: { audits } }) => extendConnection(prev, audits, 'audits'),
              })}
            />
          </Box>
        </Box>
      )}
    </Box>
  )
}
