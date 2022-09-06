import './chart.css'

import { useContext, useRef, useState } from 'react'
import { Box } from 'grommet'
import { useMutation, useQuery } from '@apollo/client'
import {
  Link, Outlet, useLocation, useParams,
} from 'react-router-dom'
import {
  Button, Tab, TabList, TabPanel,
} from 'pluralsh-design-system'
import moment from 'moment'

import { A, Flex } from 'honorable'

import {
  ResponsiveLayoutContentContainer, ResponsiveLayoutSidecarContainer, ResponsiveLayoutSidenavContainer, ResponsiveLayoutSpacer,
} from 'components/layout/ResponsiveLayout'

import { GoBack } from 'components/utils/GoBack'

import { LinkTabWrap } from 'components/utils/Tabs'

import { PluralConfigurationContext } from '../login/CurrentUser'

import {
  PackageGrade, PackageHeader, PackageProperty, PackageVersionPicker, dockerPull,
} from './common/misc'

import { CHART_Q, INSTALL_CHART, UPDATE_CHART_INST } from './queries'
import { DEFAULT_CHART_ICON } from './constants'

import { DetailContainer } from './Installation'

function ChartInfo({ version: { helm, insertedAt } }) {
  return (
    <DetailContainer
      title="chart.yaml"
      pad="small"
      gap="small"
      style={{ overflow: 'hidden' }}
    >
      <PackageProperty header="App Version">{helm.appVersion}</PackageProperty>
      <PackageProperty header="Created">{moment(insertedAt).fromNow()}</PackageProperty>
      {(!!helm?.sources?.length && (
        <PackageProperty header="Sources">
          {(helm.sources).map(l => (
            <Box>
              <A
                inline
                key={l}
                href={l}
                target="_blank"
                rel="noopener noreferrer"
                style={{ wordWrap: 'break-word' }}
              >
                {l}
              </A>
            </Box>
          ))}
        </PackageProperty>
      ))}
      {(!!helm?.maintainers?.length && (
        <PackageProperty header="Maintainers">
          {(helm.maintainers).map(m => <Box key={m.email}>{m.email}</Box>)}
        </PackageProperty>
      ))}
    </DetailContainer>
  )
}

function ChartInstaller({ chart }) {
  const [mutation, { error }] = useMutation(chart.installation ? UPDATE_CHART_INST : INSTALL_CHART, {
    variables: {
      id: chart.installation ? chart.installation.id : chart.repository.installation.id,
      attributes: { chartId: chart.id, versionId: chart.installation?.version?.id },
    },
    update: (cache, { data }) => {
      const ci = data.installChart || data.updateChartInstallation
      const prev = cache.readQuery({ query: CHART_Q, variables: { chartId: chart.id } })

      cache.writeQuery({
        query: CHART_Q,
        variables: { chartId: chart.id },
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

export function ChartActions({ chart, currentVersion, ...props }) {
  if (chart.installation?.version?.id === currentVersion.id || !chart.repository.installation) {
    return null
  }

  return <Box {...props}><ChartInstaller chart={chart} /></Box>
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
            style={{ wordWrap: 'break-word' }}
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
  const [version, setVersion] = useState(null)
  const { data, fetchMore } = useQuery(CHART_Q, { variables: { chartId }, fetchPolicy: 'cache-and-network' })
  const tabStateRef = useRef()

  if (!data) return null

  const { versions, chart } = data
  const { edges, pageInfo } = versions
  const currentVersion = version || edges[0].node
  const chartInst = data.chart.installation

  const DIRECTORY = [
    { label: 'Readme', path: '' },
    { label: 'Configuration', path: '/configuration' },
    { label: 'Dependencies', path: '/dependencies' },
    {
      label: (
        <Flex
          flexGrow={1}
          justifyContent="space-between"
        >
          Security
          {currentVersion?.scan && (
            <PackageGrade grade={currentVersion.scan.grade} />
          )}
        </Flex>
      ),
      textValue: 'Security',
      path: '/security',
    },
    { label: 'Update queue', path: '/updatequeue' },
  ]
  const pathPrefix = `/charts/${chart.id}`

  const filteredDirectory = DIRECTORY.filter(({ path }) => {
    switch (path) {
    case '/updatequeue':
      return !!chartInst
    default:
      return true
    }
  })
  const currentTab = [...filteredDirectory]
    .sort((a, b) => b.path.length - a.path.length)
    .find(tab => pathname?.startsWith(`${pathPrefix}${tab.path}`))

  return (
    <Box
      direction="column"
      fill
    >
      <GoBack
        text="Back to packages"
        link={`/repository/${chart.repository.id}/packages/helm`}
      />
      <Box
        pad="16px"
        direction="row"
      >
        <ResponsiveLayoutSidenavContainer>
          <Box
            pad={{ left: '16px' }}
            width="240px"
          >
            <PackageHeader
              name={currentVersion.chart.name}
              icon={currentVersion.chart.icon || DEFAULT_CHART_ICON}
            />
            <PackageVersionPicker
              edges={edges}
              installed={chartInst}
              version={version || currentVersion}
              setVersion={setVersion}
              pageInfo={pageInfo}
              fetchMore={fetchMore}
            />
          </Box>
          <TabList
            stateRef={tabStateRef}
            stateProps={{
              orientation: 'vertical',
              selectedKey: currentTab?.path,
            }}
          >
            {filteredDirectory.map(({ label, textValue, path }) => (
              <LinkTabWrap
                key={path}
                textValue={typeof label === 'string' ? label : textValue || ''}
                to={`${pathPrefix}${path}`}
              >
                <Tab>{label}</Tab>
              </LinkTabWrap>
            ))}
          </TabList>
        </ResponsiveLayoutSidenavContainer>
        <ResponsiveLayoutSpacer />
        <TabPanel
          as={<ResponsiveLayoutContentContainer />}
          stateRef={tabStateRef}
        >
          <Outlet
            context={{ helmChart: chart, currentHelmChart: currentVersion }}
          />
        </TabPanel>
        <ResponsiveLayoutSidecarContainer width="200px">
          <Box
            direction="column"
            gap="small"
          >
            <ChartActions
              chart={chart}
              currentVersion={currentVersion}
              height="54px"
            />
            <ChartInfo version={currentVersion} />
            <ImageDependencies version={currentVersion} />
          </Box>
        </ResponsiveLayoutSidecarContainer>
        <ResponsiveLayoutSpacer />
      </Box>
    </Box>
  )
}
