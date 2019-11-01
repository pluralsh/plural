import React, { useState } from 'react'
import {Box, Text, Anchor, Markdown, Tabs, Tab} from 'grommet'
import {useQuery} from 'react-apollo'
import {useParams} from 'react-router-dom'
import Scroller from '../utils/Scroller'
import {CHART_Q} from './queries'
import moment from 'moment'
import {DEFAULT_CHART_ICON} from './constants'
import Highlight from 'react-highlight'

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
      <Text size='small'>{(helm.sources || []).map((m) => <Anchor href={m}>{m}</Anchor>)}</Text>
      <Text weight='bold' size='small'>Maintainers</Text>
      <Text size='small'>{(helm.maintainers || []).map((m) => <Box>{m.email}</Box>)}</Text>
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
      <Highlight language='yml'>
        {valuesTemplate || ''}
      </Highlight>
    </Box>
  )
}

function ChartHeader({helm, chart, version}) {
  return (
    <Box direction='row' align='center' gap='small' margin={{bottom: 'small'}} style={{minHeight: '50px'}}>
      <Box width='50px' heigh='50px'>
        <img alt='' width='50px' height='50px' src={chart.icon || DEFAULT_CHART_ICON} />
      </Box>
      <Box>
        <Text size='medium'>{chart.name} - {version}</Text>
        <Text size='small'><i>{helm.description}</i></Text>
      </Box>
    </Box>
  )
}

function ChartReadme({readme}) {
  return (
    <Box gap='small' style={{maxHeight: '100%', overflow: 'auto'}}>
      <Box>
        <Markdown components={MARKDOWN_STYLING}>
          {readme || 'the developer needs to upload a values.yaml.eex'}
        </Markdown>
      </Box>
    </Box>
  )
}

function Chart() {
  const {chartId} = useParams()
  const [version, setVersion] = useState(null)
  const {loading, data, fetchMore} = useQuery(CHART_Q, {variables: {chartId}})
  if (loading || !data) return null

  const {edges, pageInfo} = data.versions
  const currentVersion = version || edges[0].node
  return (
    <Box pad='small' direction='row' height="100%">
      <Box width='70%' pad='small' border='right'>
        <ChartHeader {...currentVersion} />
        <Tabs justify='start' flex>
          <Tab title='Readme'>
            <ChartReadme {...currentVersion} />
          </Tab>
          <Tab title='Configuration'>
            <TemplateView {...currentVersion} />
          </Tab>
        </Tabs>
      </Box>
      <Box pad='small' width='30%' gap='small'>
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
      </Box>
    </Box>
  )
}

export default Chart