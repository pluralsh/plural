import React from 'react'
import {Box, Text} from 'grommet'
import {useQuery} from 'react-apollo'
import {useParams} from 'react-router-dom'
import Scroller from '../utils/Scroller'
import {CHART_Q} from './queries'

function ChartVersion({version}) {
  console.log(version)
  return (
    <Box gap='small'>
      <Text size='small' weight='bold'>{version.chart.name} - {version.version}</Text>
      <Text size='small'>{JSON.stringify(version.helm)}</Text>
    </Box>
  )
}

function Chart() {
  const {chartId} = useParams()
  const {loading, data, fetchMore} = useQuery(CHART_Q, {variables: {chartId}})
  if (loading || !data) return null

  const {edges, pageInfo} = data.versions
  return (
    <Box pad='small'>
      <Scroller id='chart'
        edges={edges}
        style={{overflow: 'auto', height: '100%', width: '100%'}}
        mapper={({node}, next) => <ChartVersion key={node.id} version={node} hasNext={!!next} />}
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
  )
}

export default Chart