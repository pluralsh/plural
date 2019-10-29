import React from 'react'
import {Box, Text, Anchor} from 'grommet'
import {useQuery, useMutation} from 'react-apollo'
import {useParams, useHistory} from 'react-router-dom'
import Scroller from '../utils/Scroller'
import {REPO_Q} from './queries'
import {DEFAULT_CHART_ICON} from './constants'

function Chart({chart, hasNext}) {
  let history = useHistory()
  return (
    <Box pad='small' direction='row' gap='small' border={hasNext ? 'bottom' : null}>
      <Box width='50px' heigh='50px'>
        <img alt='' width='50px' height='50px' src={chart.icon || DEFAULT_CHART_ICON} />
      </Box>
      <Box gap='xxsmall' justify='center'>
        <Anchor size='small' onClick={() => history.push(`/charts/${chart.id}`)}>
          {chart.name}
        </Anchor>
        <Text size='small'>
          {chart.description}
        </Text>
      </Box>
    </Box>
  )
}

function Repository(props) {
  const {repositoryId} = useParams()
  const {loading, data, fetchMore} = useQuery(REPO_Q, {variables: {repositoryId}})

  if (loading) return null
  const {edges, pageInfo} = data.charts
  const repository = data.repository
  return (
    <Box pad='medium'>
      <Box direction='row' align='center' margin={{bottom: 'medium'}}>
        <Box direction='row' align='center'>
          <Box width='50px' heigh='50px'>
            <img alt='' width='50px' height='50px' src={repository.icon} />
          </Box>
          <Box gap='xsmall' pad='small'>
            <Text weight='bold'>{repository.name}</Text>
            <Text size='small'>{repository.description}</Text>
          </Box>
        </Box>
        {repository.installation && (
          <Box>

          </Box>
        )}
      </Box>
      <Scroller id='charts'
        edges={edges}
        style={{overflow: 'auto', height: '100%', width: '100%'}}
        mapper={({node}, next) => <Chart key={node.id} chart={node} hasNext={!!next.node} />}
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
  )
}

export default Repository