import React, { useState, useContext, useEffect, useCallback } from 'react'
import { Box, Text, Anchor, Markdown, Select, Layer } from 'grommet'
import { useQuery, useMutation } from 'react-apollo'
import { useParams } from 'react-router-dom'
import { Scroller, Button, SecondaryButton, ScrollableContainer, Tabs, TabHeader, TabHeaderItem, TabContent, ModalHeader } from 'forge-core'
import { CHART_Q, INSTALL_CHART, UPDATE_CHART_INST, UPDATE_VERSION } from './queries'
import moment from 'moment'
import { DEFAULT_CHART_ICON } from './constants'
import Highlight from 'react-highlight.js'
import Installation, { DetailContainer } from './Installation'
import { BreadcrumbContext } from '../Forge'
import Dependencies, { FullDependencies, ShowFull } from './Dependencies'
import './chart.css'

function VersionTag({tag: {tag}, onClick}) {
  return (
    <Box
      round='xsmall'
      align='center'
      justify='center'
      background='sidebar'
      onClick={onClick}
      pad={{horizontal: 'small', vertical: 'xxsmall'}}>
      <Text size='xsmall'>{tag}</Text>
    </Box>
  )
}

export const TAGS = [
  'latest',
  'stable',
  'warm'
]

function EditTags({version, setOpen, refetch}) {
  const [value, setValue] = useState('stable')
  const [current, setCurrent] = useState((version.tags || []).map(({tag}) => ({tag})))
  const addTag = useCallback((tag) => {
    setCurrent([...current, {tag}])
    setValue('')
  }, [current, setCurrent, setValue])
  const removeTag = useCallback((tag) => setCurrent(current.filter((c) => c.tag !== tag)), [current, setCurrent])
  const [mutation, {loading}] = useMutation(UPDATE_VERSION, {
    variables: {id: version.id, attributes: {tags: current}},
    onCompleted: () => { setOpen(false); refetch() }
  })

  return (
    <Box width='40vw'>
      <ModalHeader text='Edit tags' setOpen={setOpen} />
      <Box gap='small' pad='small'>
        <Box direction='row' gap='small' align='center'>
          <Box direction='row' gap='xsmall' align='center'>
            {current.length > 0 ?
              (current.map((tag) => <VersionTag key={tag} tag={tag} onClick={() => removeTag(tag.tag)} />)) :
              <Text size='small'>Add a tag...</Text>}
          </Box>
          <Select
            options={TAGS.filter(name => !current.find(({tag}) => tag === name))}
            value={value}
            onChange={({option}) => setValue(option)} />
          <SecondaryButton label='add' onClick={() => addTag(value)} />
        </Box>
        <Box direction='row' align='center' justify='end'>
          <Button label='Update' onClick={mutation} loading={loading} />
        </Box>
      </Box>
    </Box>
  )
}

function ChartVersion({chart, version, onSelect, refetch}) {
  const [open, setOpen] = useState(false)

  return (
    <Box direction='row' align='center' className='chart-version' height='30px'>
      <Box direction='row' fill='horizontal' align='center' gap='xsmall'>
        <Anchor size='small' onClick={() => onSelect(version)}>
          {version.version}
        </Anchor>
        <Text size='small' truncate>- {moment(version.insertedAt).fromNow()}</Text>
      </Box>
      <Box flex={false} className='tags' direction='row' gap='xxsmall'>
        {version.tags.map((tag) => <VersionTag key={tag} tag={tag} />)}
      </Box>
      <Box flex={false} className='edit'>
        <Anchor size='small' onClick={() => setOpen(true)}>edit tags</Anchor>
      </Box>
      {open && (
        <Layer modal>
          <EditTags chart={chart} version={version} setOpen={setOpen} refetch={refetch} />
        </Layer>
      )}
    </Box>
  )
}

function ChartInfo({helm, insertedAt}) {
  return (
    <DetailContainer pad='small' gap='small' style={{overflow: 'hidden'}}>
      <Text weight="bold" size='small'>App Version</Text>
      <Text size='small'>{helm.appVersion}</Text>
      <Text weight='bold' size='small'>Created</Text>
      <Text size='small'>{moment(insertedAt).fromNow()}</Text>
      <Text weight='bold' size='small'>Source</Text>
      <Text size='small'>{(helm.sources || []).map((l) => <Anchor key={l} href={l}>{l}</Anchor>)}</Text>
      <Text weight='bold' size='small'>Maintainers</Text>
      <Text size='small'>{(helm.maintainers || []).map((m) => <Box key={m.email}>{m.email}</Box>)}</Text>
    </DetailContainer>
  )
}

function Code({value, children, language}) {
  return (
    <Highlight language={language}>
      {value || children}
    </Highlight>
  )
}

export const MARKDOWN_STYLING = {
  p: {props: {size: 'small', style: {maxWidth: '100%'}, margin: {top: 'xsmall', bottom: 'xsmall'}}},
  h1: {props: {style: {borderBottom: '1px solid #eaecef', paddingBottom: '.3em', maxWidth: '100%'}, size: 'small', margin: {top: 'small', bottom: 'small'}}},
  h2: {props: {style: {borderBottom: '1px solid #eaecef', paddingBottom: '.3em', maxWidth: '100%'}, size: 'xsmall', margin: {top: 'small', bottom: 'small'}}},
  pre: {
    component: Code,
    props: {}
  }
}

function TemplateView({valuesTemplate}) {
  return (
    <Box style={{overflow: 'auto', maxHeight: '100%'}} pad='small'>
      <Highlight language='yaml'>
        {valuesTemplate || 'no values template'}
      </Highlight>
    </Box>
  )
}

function ChartInstaller({chartInstallation, versionId, chartId, installation}) {
  const [mutation, {error}] = useMutation(chartInstallation ? UPDATE_CHART_INST : INSTALL_CHART, {
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

  return (
    <Button
      round='xsmall'
      label='Install'
      pad='small'
      error={error}
      onClick={mutation} />
  )
}

function ChartHeader({helm, chart, version, chartInstallation, id, installation}) {
  return (
    <Box direction='row' align='center' gap='medium' margin={{bottom: 'small'}} style={{minHeight: '50px'}}>
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
        installation && (<ChartInstaller
          chartInstallation={chartInstallation}
          installation={installation}
          versionId={id}
          chartId={chart.id} />)
      }
      </Box>
    </Box>

  )
}

function ChartReadme({readme}) {
  return (
    <Box gap='small' pad='small' style={{maxHeight: '100%', overflow: 'auto'}}>
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

export default function Chart() {
  const {chartId} = useParams()
  const [version, setVersion] = useState(null)
  const [tab, setTab] = useState(false)
  const [full, setFull] = useState(false)
  const {loading, data, fetchMore, refetch} = useQuery(CHART_Q, {variables: {chartId}})
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

  const {versions, chart} = data
  const repository = chart.repository
  const {edges, pageInfo} = versions
  const currentVersion = version || edges[0].node
  const width = tab === 'configuration' ? 65 : 70

  return (
    <ScrollableContainer>
      <Box pad='small' direction='row'>
        <Box width={`${width}%`} pad='small'>
          <ChartHeader {...currentVersion} chartInstallation={data.chart.installation} installation={repository.installation} />
          <Tabs defaultTab='readme' onTabChange={setTab} headerEnd={tab === 'dependencies' ?
            <ShowFull label={full ? 'Immediate' : 'Full'} onClick={() => setFull(!full)} /> : null
          }>
            <TabHeader>
              <TabHeaderItem name='readme'>
                <Text style={{fontWeight: 500}} size='small'>Readme</Text>
              </TabHeaderItem>
              <TabHeaderItem name='configuration'>
                <Text style={{fontWeight: 500}} size='small'>Configuration</Text>
              </TabHeaderItem>
              <TabHeaderItem name='dependencies'>
                <Text size='small' style={{fontWeight: 500}}>Dependencies</Text>
              </TabHeaderItem>
            </TabHeader>
            <TabContent name='readme'>
              <ChartReadme {...currentVersion} />
            </TabContent>
            <TabContent name='configuration'>
              <TemplateView {...currentVersion} />
            </TabContent>
            <TabContent name='dependencies'>
              {full ? <FullDependencies {...chart} /> : <Dependencies {...chart} />}
            </TabContent>
          </Tabs>
        </Box>
        <Box pad='small' width={`${100 - width}%`}>
          {tab === 'configuration' ? <Installation repository={repository} onUpdate={updateInstallation(chartId)} open /> : (
            <Box gap='small'>
              <DetailContainer gap='xsmall' pad='small' style={{maxHeight: '50%'}}>
                <Text size='small' weight='bold'>Versions</Text>
                <Scroller id='chart'
                  edges={edges}
                  style={{overflow: 'auto', width: '100%', maxHeight: '50vh'}}
                  mapper={({node}, next) => (
                    <ChartVersion
                      key={node.id}
                      version={node}
                      hasNext={!!next}
                      onSelect={setVersion}
                      refetch={refetch} />
                  )}
                  onLoadMore={() => {
                    pageInfo.hasNextPage && fetchMore({
                      variables: {cursor: pageInfo.endCursor},
                      updateQuery: (prev, {fetchMoreResult: {versions: {edges, pageInfo}}}) => {
                        return {
                          ...prev, versions: {
                            ...prev.versions, pageInfo, edges: [...prev.versions.edges, ...edges]
                          }
                        }
                      }
                    })
                  }} />
              </DetailContainer>
              <ChartInfo {...currentVersion} />
            </Box>
          )}
        </Box>
      </Box>
    </ScrollableContainer>
  )
}