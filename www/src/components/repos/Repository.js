import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {useQuery} from 'react-apollo'
import {useParams, useHistory} from 'react-router-dom'
import Scroller from '../utils/Scroller'
import {REPO_Q} from './queries'
import {DEFAULT_CHART_ICON} from './constants'
import Installation from './Installation'

function Chart({chart}) {
  let history = useHistory()
  const [hover, setHover] = useState(false)
  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => history.push(`/charts/${chart.id}`)}
      style={{cursor: 'pointer'}}
      background={hover ? 'light-2' : null}
      pad='small'
      direction='row'
      gap='small'
      border
      round='xsmall'>
      <Box width='50px' heigh='50px'>
        <img alt='' width='50px' height='50px' src={chart.icon || DEFAULT_CHART_ICON} />
      </Box>
      <Box gap='xxsmall' justify='center'>
        <Text size='small' >
          {chart.name}
        </Text>
        <Text size='small'>
          {chart.latestVersion} {chart.description ? `- ${chart.description}` : null}
        </Text>
      </Box>
    </Box>
  )
}

function Repository() {
  const {repositoryId} = useParams()
  const {loading, data, fetchMore} = useQuery(REPO_Q, {variables: {repositoryId}})

  if (loading) return null
  const {edges, pageInfo} = data.charts
  const repository = data.repository
  return (
    <Box pad='small' direction='row' height='100%'>
      <Box pad='small' width='60%' height='100%' border='right'>
        <Box direction='row' align='center' margin={{bottom: 'medium'}}>
          <Box width='50px' heigh='50px'>
            <img alt='' width='50px' height='50px' src={repository.icon} />
          </Box>
          <Box gap='xsmall' pad='small'>
            <Text weight='bold'>{repository.name}</Text>
            <Text size='small'>{repository.description}</Text>
          </Box>
        </Box>
        <Scroller id='charts'
          edges={edges}
          style={{overflow: 'auto', height: '100%', width: '100%'}}
          mapper={({node}) => <Chart key={node.id} chart={node} />}
          emptyState={<Text size='medium'>No charts uploaded yet</Text>}
          onLoadMore={() => {
            if (!pageInfo.hasNextPage) return

            fetchMore({
              variables: {chartCursor: pageInfo.endCursor},
              updateQuery: (prev, {fetchMoreResult}) => {
                const {edges, pageInfo} = fetchMoreResult.charts
                return edges.length ? {
                  ...prev,
                  charts: {
                    ...prev.charts,
                    pageInfo,
                    edges: [...prev.charts.edges, ...edges]
                  }
                } : prev
              }
            })
          }}
        />
      </Box>
      <Box pad='small' width='40%'>
        <Installation repository={repository} />
      </Box>
    </Box>
  )
}

export default Repository