import React, { useState, useContext, useEffect } from 'react'
import {Box, Text, Anchor, Markdown, Tabs, Tab} from 'grommet'
import {useQuery, useMutation} from 'react-apollo'
import {useParams} from 'react-router-dom'
import Scroller from '../utils/Scroller'
import {CHART_Q, INSTALL_CHART, UPDATE_CHART_INST} from './queries'
import moment from 'moment'
import {DEFAULT_CHART_ICON} from './constants'
import Highlight from 'react-highlight'
import Installation from './Installation'
import Button from '../utils/Button'
import {BreadcrumbContext} from '../Chartmart'

function ChartVersion({version, onSelect}) {
  return (
    <Box direction='row' align='center' gap='xsmall'>
      <Anchor size='small' onClick={() => onSelect(version)}>
        {version.version}
      </Anchor> - <Text size='small'>{moment(version.insertedAt).fromNow()}</Text>
    </Box>
  )
}

function ChartInfo({helm, insertedAt}) {
  return (
    <Box pad='small' elevation='small' gap='small' style={{overflow: 'hidden'}}>
      <Text weight="bold" size='small'>App Version</Text>
      <Text size='small'>{helm.appVersion}</Text>
      <Text weight='bold' size='small'>Created</Text>
      <Text size='small'>{moment(insertedAt).fromNow()}</Text>
      <Text weight='bold' size='small'>Source</Text>
      <Text size='small'>{(helm.sources || []).map((l) => <Anchor key={l} href={l}>{l}</Anchor>)}</Text>
      <Text weight='bold' size='small'>Maintainers</Text>
      <Text size='small'>{(helm.maintainers || []).map((m) => <Box key={m.email}>{m.email}</Box>)}</Text>
    </Box>
  )
}

function Code({value, children, language}) {
  return (
    <Highlight language={language || 'sh'}>
      {value || children}
    </Highlight>
  )
}

const MARKDOWN_STYLING = {
  p: {props: {size: 'small', margin: {top: 'xsmall', bottom: 'xsmall'}}},
  h1: {props: {style: {borderBottom: '1px solid #eaecef', paddingBottom: '.3em', maxWidth: '100%'}, size: 'small', margin: {top: 'small', bottom: 'small'}}},
  h2: {props: {style: {borderBottom: '1px solid #eaecef', paddingBottom: '.3em', maxWidth: '100%'}, size: 'xsmall', margin: {top: 'small', bottom: 'small'}}},
  pre: {
    component: Code,
    props: {}
  }
}

function TemplateView({valuesTemplate}) {
  return (
    <Box style={{overflow: 'auto', maxHeight: '100%'}}>
      <Highlight language='yaml'>
        {valuesTemplate || 'no values template'}
      </Highlight>
    </Box>
  )
}

function ChartInstaller({chartInstallation, versionId, chartId, installation}) {
  const [mutation] = useMutation(chartInstallation ? UPDATE_CHART_INST : INSTALL_CHART, {
    variables: {
      id: chartInstallation ? chartInstallation.id : installation.id,
      attributes: {chartId, versionId}
    },
    update: (cache, {data}) => {
      const ci = data.installChart || data.updateChartInstallation
      const prev = cache.readQuery({ query: CHART_Q, variables: {chartId} })
      cache.writeQuery({query: CHART_Q, variables: {chartId}, data: {
        ...prev,
        chart: {
          ...prev.chart,
          installation: ci
        }
      }})
    }
  })

  return <Button round='xsmall' label='Install' pad='small' onClick={mutation} />
}

function ChartHeader({helm, chart, version, chartInstallation, id, installation}) {
  return (
    <Box direction='row' align='center' gap='small' margin={{bottom: 'small'}} style={{minHeight: '50px'}}>
      <Box width='50px' heigh='50px'>
        <img alt='' width='50px' height='50px' src={chart.icon || DEFAULT_CHART_ICON} />
      </Box>
      <Box width='100%'>
        <Text size='medium'>{chart.name} - {version}</Text>
        <Text size='small'><i>{helm.description}</i></Text>
      </Box>
      <Box width='100px' direction='row' justify='end'>
      {chartInstallation && chartInstallation.version.id === id ?
        <Box round='xsmall' pad='small' border>Installed</Box> :
        <ChartInstaller
          chartInstallation={chartInstallation}
          installation={installation}
          versionId={id}
          chartId={chart.id} />
      }
      </Box>
    </Box>

  )
}

function ChartReadme({readme}) {
  return (
    <Box gap='small' style={{maxHeight: '100%', overflow: 'auto'}}>
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
    const prev = cache.readQuery({query: CHART_Q, variables: {chartId}})
    cache.writeQuery({
      query: CHART_Q,
      variables: {chartId},
      data: {...prev, chart: {...prev.chart, repository: {...prev.chart.repository, installation: installation}}}
    })
  }
}

function Chart() {
  const {chartId} = useParams()
  const [version, setVersion] = useState(null)
  const [edit, setEdit] = useState(false)
  const {loading, data, fetchMore} = useQuery(CHART_Q, {variables: {chartId}})
  const {setBreadcrumbs} = useContext(BreadcrumbContext)
  useEffect(() => {
    if (!data) return
    const {chart} = data
    setBreadcrumbs([
      {url: `/publishers/${chart.repository.publisher.id}`, text: chart.repository.publisher.name},
      {url: `/repositories/${chart.repository.id}`, text: chart.repository.name},
      {url: `/charts/${chart.id}`, text: chart.name}
    ])
  }, [data, setBreadcrumbs])

  if (loading || !data) return null

  const {versions, chart: {repository}} = data
  const {edges, pageInfo} = versions
  const currentVersion = version || edges[0].node
  const width = edit ? 60 : 70

  return (
    <Box pad='small' direction='row' height="100%">
      <Box width={`${width}%`} pad='small' border='right'>
        <ChartHeader {...currentVersion} chartInstallation={data.chart.installation} installation={repository.installation} />
        <Tabs justify='start' flex onActive={(tab) => { console.log(tab); setEdit(tab === 1) }}>
          <Tab title='Readme'>
            <ChartReadme {...currentVersion} />
          </Tab>
          <Tab title='Configuration'>
            <TemplateView {...currentVersion} />
          </Tab>
        </Tabs>
      </Box>
      <Box pad='small' width={`${100 - width}%`} gap='small'>
        {edit ? <Installation repository={repository} onUpdate={updateInstallation(chartId)} /> :
          (<>
          <Box elevation='small' gap='xsmall' pad='small' style={{maxHeight: '50%'}}>
            <Text size='small' weight='bold'>Versions</Text>
            <Scroller id='chart'
              edges={edges}
              style={{overflow: 'auto', width: '100%'}}
              mapper={({node}, next) => <ChartVersion key={node.id} version={node} hasNext={!!next} onSelect={setVersion} />}
              onLoadMore={() => {
                if (!pageInfo.hasNextPage) return

                fetchMore({
                  variables: {chartCursor: pageInfo.endCursor},
                  updateQuery: (prev, {fetchMoreResult}) => {
                    const {edges, pageInfo} = fetchMoreResult.versions
                    return edges.length ? {
                      ...prev,
                      versions: {
                        ...prev.versions,
                        pageInfo,
                        edges: [...prev.versions.edges, ...edges]
                      }
                    } : prev
                  }
                })
              }} />
          </Box>
          <ChartInfo {...currentVersion} />
          </>)}
      </Box>
    </Box>
  )
}

export default Chart