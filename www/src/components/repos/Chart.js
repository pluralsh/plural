import './chart.css'

import { useContext, useEffect, useState } from 'react'
import { Box } from 'grommet'
import { useMutation, useQuery } from '@apollo/client'
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button, Tab } from 'pluralsh-design-system'
import { ScrollableContainer } from 'forge-core'
import moment from 'moment'
import Highlight from 'react-highlight.js'

import { A, Flex } from 'honorable'

import { PluralConfigurationContext } from '../login/CurrentUser'
import { Breadcrumbs, BreadcrumbsContext } from '../Breadcrumbs'

import { PackageVersionPicker } from './common/PackageVersionPicker'

import { CHART_Q, INSTALL_CHART, UPDATE_CHART_INST } from './queries'
import { DEFAULT_CHART_ICON } from './constants'

import { DetailContainer, DetailProperty } from './Installation'
import { PackageGrade, PackageHeader, dockerPull } from './common/misc'

function ChartInfo({ version: { helm, insertedAt } }) {
  return (
    <DetailContainer
      title="chart.yaml"
      pad="small"
      gap="small"
      style={{ overflow: 'hidden' }}
    >
      <DetailProperty header="App Version">{helm.appVersion}</DetailProperty>
      <DetailProperty header="Created">{moment(insertedAt).fromNow()}</DetailProperty>
      {(!!helm?.sources?.length && (
        <DetailProperty header="Sources">
          {(helm.sources).map(l => (
            <Box>
              <A
                inline
                as={Link}
                key={l}
                to={l}
              >
                {l}
              </A>
            </Box>
          ))}
        </DetailProperty>
      ))}
      {(!!helm?.maintainers?.length && (
        <DetailProperty header="Maintainers">
          {(helm.maintainers).map(m => <Box key={m.email}>{m.email}</Box>)}
        </DetailProperty>
      ))}
    </DetailContainer>
  )
}

function Code({ value, children, language }) {
  return (
    <Highlight language={language}>
      {value || children}
    </Highlight>
  )
}

export const MARKDOWN_STYLING = {
  p: { props: { size: 'small', style: { maxWidth: '100%' }, margin: { top: 'xsmall', bottom: 'xsmall' } } },
  h1: {
    props: {
      style: { borderBottom: '1px solid #eaecef', paddingBottom: '.3em', maxWidth: '100%' },
      size: 'small',
      margin: { top: 'small', bottom: 'small' },
    },
  },
  h2: {
    props: {
      style: { borderBottom: '1px solid #eaecef', paddingBottom: '.3em', maxWidth: '100%' },
      size: 'xsmall',
      margin: { top: 'small', bottom: 'small' },
    },
  },
  pre: { component: Code, props: {} },
}

function ChartInstaller({ chartInstallation, versionId, chartId, installation }) {
  const [mutation, { error }] = useMutation(chartInstallation ? UPDATE_CHART_INST : INSTALL_CHART, {
    variables: {
      id: chartInstallation ? chartInstallation.id : installation.id,
      attributes: { chartId, versionId },
    },
    update: (cache, { data }) => {
      const ci = data.installChart || data.updateChartInstallation
      const prev = cache.readQuery({ query: CHART_Q, variables: { chartId } })
      cache.writeQuery({
        query: CHART_Q,
        variables: { chartId },
        data: {
          ...prev,
          chart: {
            ...prev.chart,
            installation: ci,
          },
        },
      })
    },
  })

  return (
    <Button
      secondary
      error={error}
      onClick={mutation}
    >
      Install
    </Button>
  )
}

function ImageDependencies({ version: { imageDependencies } }) {
  const { registry } = useContext(PluralConfigurationContext)
  if (!imageDependencies || imageDependencies.length === 0) return null

  return (
    <DetailContainer
      title="Docker Images"
      pad="small"
      gap="small"
      style={{ overflow: 'auto' }}
    >
      {imageDependencies.map(({ id, image }) => (
        <Box key={id}>
          <A
            inline
            as={Link}
            to={`/dkr/img/${image.id}`}
          >
            {dockerPull(registry, image)}
          </A>
        </Box>
      ))}
    </DetailContainer>
  )
}

export default function Chart() {
  const { chartId } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [version, setVersion] = useState(null)
  const { data, fetchMore, refetch } = useQuery(CHART_Q, {
    variables: { chartId },
    fetchPolicy: 'cache-and-network',
  })
  const { setBreadcrumbs } = useContext(BreadcrumbsContext)
  useEffect(() => {
    if (!data) return
    const { chart } = data
    setBreadcrumbs([
      { url: '/marketplace', text: 'Marketplace' },
      { url: `/repository/${chart.repository.id}/packages/helm`, text: chart.repository.name },
      { url: `/charts/${chart.id}`, text: chart.name },
    ])
  }, [data, setBreadcrumbs])

  if (!data) return null

  const { versions, chart } = data
  const { repository } = chart
  const { edges, pageInfo } = versions
  const currentVersion = version || edges[0].node
  const chartInst = data.chart.installation

  return (
    <Box direction="column">
      <Flex
        paddingVertical={18}
        marginLeft="xlarge"
        marginRight="xlarge"
        paddingLeft="xsmall"
        paddingRight="xsmall"
        borderBottom="1px solid border"
      >
        <Breadcrumbs />
      </Flex>
      <ScrollableContainer>
        <Box
          pad="medium"
          direction="row"
        >
          <Box
            direction="column"
            basis="medium"
          >
            <PackageHeader
              name={currentVersion.chart.name}
              icon={currentVersion.chart.icon || DEFAULT_CHART_ICON}
            />
            <PackageVersionPicker
              edges={edges}
              version={version || currentVersion}
              setVersion={setVersion}
            />
            <Tab
              vertical
              onClick={() => navigate(`/charts/${chart.id}`)}
              active={pathname.endsWith(`/charts/${chart.id}`)}
              textDecoration="none"
            >
              Readme
            </Tab>
            <Tab
              vertical
              onClick={() => navigate(`/charts/${chart.id}/configuration`)}
              active={pathname.startsWith(`/charts/${chart.id}/configuration`)}
              textDecoration="none"
            >
              Configuration
            </Tab>
            <Tab
              vertical
              onClick={() => navigate(`/charts/${chart.id}/dependencies`)}
              active={pathname.startsWith(`/charts/${chart.id}/dependencies`)}
              textDecoration="none"
            >
              Dependencies
            </Tab>
            <Tab
              vertical
              onClick={() => navigate(`/charts/${chart.id}/security`)}
              active={pathname.startsWith(`/charts/${chart.id}/security`)}
              textDecoration="none"
            >
              <Flex
                flexGrow={1}
                justifyContent="space-between"
              >
                Security
                {currentVersion?.scan && <PackageGrade scan={currentVersion.scan} />}
              </Flex>
            </Tab>
            {(chartInst && (
              <Tab
                vertical
                onClick={() => navigate(`/charts/${chart.id}/updatequeue`)}
                active={pathname.startsWith(`/charts/${chart.id}/updatequeue`)}
                textDecoration="none"
              >
                Update queue
              </Tab>
            ))}

          </Box>
          <Box fill><Outlet context={{ helmChart: chart, currentHelmChart: currentVersion }} /></Box>
          <Box
            basis="medium"
            direction="column"
            pad="small"
            gap="small"
          >
            <Box height="44px">
              {chartInst?.version?.id !== currentVersion.id && repository.installation && (
                <ChartInstaller
                  chartInstallation={chartInst}
                  installation={repository.installation}
                  versionId={chartInst?.version?.id}
                  chartId={chart.id}
                />
              )}
            </Box>
            <ChartInfo version={currentVersion} />
            <ImageDependencies version={currentVersion} />
          </Box>
        </Box>
      </ScrollableContainer>
    </Box>
  )
}
