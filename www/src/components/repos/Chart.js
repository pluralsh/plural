import './chart.css'

import { useContext, useEffect, useState } from 'react'
import { Anchor, Box, Markdown, Text } from 'grommet'
import { useMutation, useQuery } from '@apollo/client'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, ScrollableContainer, TabContent, TabHeader, TabHeaderItem, Tabs } from 'forge-core'
import moment from 'moment'
import Highlight from 'react-highlight.js'
import { Docker } from 'grommet-icons'

import { Versions } from '../versions/Versions'
import { PluralConfigurationContext } from '../login/CurrentUser'
import { BreadcrumbsContext } from '../Breadcrumbs'

import { CHART_Q, INSTALL_CHART, UPDATE_CHART_INST } from './queries'
import { DEFAULT_CHART_ICON } from './constants'

import Installation, { DetailContainer } from './Installation'
import Dependencies, { FullDependencies, ShowFull } from './Dependencies'
import { dockerPull } from './misc'
import { DeferredUpdates } from './DeferredUpdates'
import { PackageGrade, ScanResults } from './PackageScan'

function ChartInfo({ version: { helm, insertedAt } }) {
  return (
    <DetailContainer
      pad="small"
      gap="small"
      style={{ overflow: 'hidden' }}
    >
      <Text
        weight="bold"
        size="small"
      >App Version
      </Text>
      <Text size="small">{helm.appVersion}</Text>
      <Text
        weight="bold"
        size="small"
      >Created
      </Text>
      <Text size="small">{moment(insertedAt).fromNow()}</Text>
      <Text
        weight="bold"
        size="small"
      >Source
      </Text>
      <Text size="small">{(helm.sources || []).map(l => (
        <Anchor
          key={l}
          href={l}
        >{l}
        </Anchor>
      ))}
      </Text>
      <Text
        weight="bold"
        size="small"
      >Maintainers
      </Text>
      <Text size="small">{(helm.maintainers || []).map(m => <Box key={m.email}>{m.email}</Box>)}</Text>
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
  h1: { props: { style: { borderBottom: '1px solid #eaecef', paddingBottom: '.3em', maxWidth: '100%' }, size: 'small', margin: { top: 'small', bottom: 'small' } } },
  h2: { props: { style: { borderBottom: '1px solid #eaecef', paddingBottom: '.3em', maxWidth: '100%' }, size: 'xsmall', margin: { top: 'small', bottom: 'small' } } },
  pre: { component: Code, props: {} },
}

function TemplateView({ version: { valuesTemplate } }) {
  return (
    <Box
      style={{ overflow: 'auto', maxHeight: '100%' }}
      pad="small"
    >
      <Highlight language="yaml">
        {valuesTemplate || 'no values template'}
      </Highlight>
    </Box>
  )
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
      cache.writeQuery({ query: CHART_Q,
        variables: { chartId },
        data: {
          ...prev,
          chart: {
            ...prev.chart,
            installation: ci,
          },
        } })
    },
  })

  return (
    <Button
      round="xsmall"
      label="Install"
      error={error}
      onClick={mutation}
    />
  )
}

function ChartHeader({ version: { helm, chart, version, scan, id }, chartInstallation, installation }) {
  return (
    <Box
      direction="row"
      align="center"
      gap="medium"
      width="100%"
      margin={{ bottom: 'small' }}
      style={{ minHeight: '50px' }}
    >
      <Box
        width="50px"
        heigh="50px"
      >
        <img
          alt=""
          width="50px"
          height="50px"
          src={chart.icon || DEFAULT_CHART_ICON}
        />
      </Box>
      <Box width="100%">
        <Box
          direction="row"
          align="center"
          gap="small"
        >
          <Text size="medium">{chart.name} - {version}</Text>
          {chartInstallation && (
            <Text
              size="small"
              color="dark-3"
            >
              (installed: {chartInstallation.version.version})
            </Text>
          )}
        </Box>
        <Text size="small">
          <i>{helm.description}</i>
        </Text>
      </Box>
      {scan && <PackageGrade scan={scan} />}
      {chartInstallation && chartInstallation.version.id === id ? (
        <Box
          width="100px"
          direction="row"
          justify="end"
        >
          <Box
            round="xsmall"
            pad={{ horizontal: 'small', vertical: 'xsmall' }}
            align="center"
            justify="center"
            border={{ color: 'border' }}
          >
            Installed
          </Box>
        </Box>
      ) :
        installation && (
          <Box
            width="100px"
            direction="row"
            justify="end"
          >
            <ChartInstaller
              chartInstallation={chartInstallation}
              installation={installation}
              versionId={id}
              chartId={chart.id}
            />
          </Box>
        )}
    </Box>
  )
}

function ChartReadme({ version: { readme } }) {
  return (
    <Box
      gap="small"
      pad="small"
      style={{ maxHeight: '100%', overflow: 'auto' }}
    >
      <Box>
        <Markdown components={MARKDOWN_STYLING}>
          {readme || 'no readme'}
        </Markdown>
      </Box>
    </Box>
  )
}

function updateInstallation(chartId) {
  return (cache, repoId, installation) => {
    const prev = cache.readQuery({ query: CHART_Q, variables: { chartId } })
    cache.writeQuery({
      query: CHART_Q,
      variables: { chartId },
      data: { ...prev, chart: { ...prev.chart, repository: { ...prev.chart.repository, installation } } },
    })
  }
}

function ImageDependencies({ version: { imageDependencies } }) {
  const { registry } = useContext(PluralConfigurationContext)
  const navigate = useNavigate()
  if (!imageDependencies || imageDependencies.length === 0) return null

  return (
    <DetailContainer style={{ overflow: 'auto' }}>
      <Box pad="small">
        <Text
          size="small"
          weight="bold"
        >Docker Images
        </Text>
      </Box>
      {imageDependencies.map(({ id, image }) => (
        <Box
          key={id}
          direction="row"
          gap="xsmall"
          align="center"
          pad={{ horizontal: 'small', vertical: 'xsmall' }}
          hoverIndicator="light-2"
          round="xsmall"
          focusIndicator={false}
          onClick={() => navigate(`/dkr/img/${image.id}`)}
        >
          <Docker
            color="plain"
            size="18px"
          />
          <Text size="small">{dockerPull(registry, image)}</Text>
        </Box>
      ))}
    </DetailContainer>
  )
}

export default function Chart() {
  const { chartId } = useParams()
  const [version, setVersion] = useState(null)
  const [tab, setTab] = useState(false)
  const [full, setFull] = useState(false)
  const { data, fetchMore, refetch } = useQuery(CHART_Q, {
    variables: { chartId },
    fetchPolicy: 'cache-and-network',
  })
  const { setBreadcrumbs } = useContext(BreadcrumbsContext)
  useEffect(() => {
    if (!data) return
    const { chart } = data
    setBreadcrumbs([
      { url: `/publishers/${chart.repository.publisher.id}`, text: chart.repository.publisher.name },
      { url: `/repositories/${chart.repository.id}`, text: chart.repository.name },
      { url: `/charts/${chart.id}`, text: chart.name },
    ])
  }, [data, setBreadcrumbs])

  if (!data) return null

  const { versions, chart } = data
  const { repository } = chart
  const { edges, pageInfo } = versions
  const currentVersion = version || edges[0].node
  const width = tab === 'configuration' ? 65 : 70
  const chartInst = data.chart.installation

  return (
    <ScrollableContainer>
      <Box
        pad="small"
        direction="row"
      >
        <Box
          width={`${width}%`}
          pad="small"
        >
          <ChartHeader
            version={currentVersion}
            chartInstallation={chartInst}
            installation={repository.installation}
          />
          <Tabs
            defaultTab="readme"
            onTabChange={setTab}
            headerEnd={tab === 'dependencies' ? (
              <ShowFull
                label={full ? 'Immediate' : 'Full'}
                onClick={() => setFull(!full)}
              />
            ) : null}
          >
            <TabHeader>
              <TabHeaderItem name="readme">
                <Text
                  weight={500}
                  size="small"
                >
                  Readme
                </Text>
              </TabHeaderItem>
              <TabHeaderItem name="configuration">
                <Text
                  weight={500}
                  size="small"
                >
                  Configuration
                </Text>
              </TabHeaderItem>
              <TabHeaderItem name="dependencies">
                <Text
                  size="small"
                  weight={500}
                >
                  Dependencies
                </Text>
              </TabHeaderItem>
              {currentVersion.scan && (
                <TabHeaderItem name="scan">
                  <Text
                    size="small"
                    weight={500}
                  >
                    Security
                  </Text>
                </TabHeaderItem>
              )}
              {chartInst && (
                <TabHeaderItem name="updates">
                  <Text
                    size="small"
                    weight={500}
                  >
                    Update Queue
                  </Text>
                </TabHeaderItem>
              )}
            </TabHeader>
            <TabContent name="readme">
              <ChartReadme version={currentVersion} />
            </TabContent>
            <TabContent name="scan">
              <ScanResults scan={currentVersion.scan} />
            </TabContent>
            <TabContent name="configuration">
              <TemplateView version={currentVersion} />
            </TabContent>
            <TabContent name="dependencies">
              {full ? <FullDependencies resource={chart} /> : (
                <Dependencies
                  name={chart.name}
                  resource={chart}
                  dependencies={(version || chart).dependencies}
                />
              )}
            </TabContent>
            {chartInst && (
              <TabContent name="updates">
                <DeferredUpdates chartInst={chartInst.id} />
              </TabContent>
            )}
          </Tabs>
        </Box>
        <Box
          pad="small"
          width={`${100 - width}%`}
        >
          {tab === 'configuration' ? (
            <Installation
              repository={repository}
              onUpdate={updateInstallation(chartId)}
              open
            />
          ) : (
            <Box gap="small">
              <Versions
                edges={edges}
                pageInfo={pageInfo}
                fetchMore={fetchMore}
                refetch={refetch}
                setVersion={setVersion}
              />
              <ChartInfo version={currentVersion} />
              <ImageDependencies version={currentVersion} />
            </Box>
          )}
        </Box>
      </Box>
    </ScrollableContainer>
  )
}
