import React from 'react'
import {Box, Text, Anchor} from 'grommet'
import {useQuery} from 'react-apollo'
import {useParams, useHistory} from 'react-router-dom'
import Scroller from '../utils/Scroller'
import {REPO_Q} from './queries'

const PLACEHOLDER = process.env.PUBLIC_URL + '/chart.png'

function Chart({chart, hasNext}) {
  let history = useHistory()
  return (
    <Box pad='small' direction='row' gap='small' border={hasNext ? 'bottom' : null}>
      <Box width='50px' heigh='50px'>
        <img alt='' width='50px' height='50px' src={chart.icon || PLACEHOLDER} />
      </Box>
      <Box gap='xxsmall' justify='center'>
        <Anchor onClick={() => history.push(`/charts/${chart.id}`)}>
          <Text size='small' weight='bold'>{chart.name}</Text>
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
    <Box pad='small'>
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
        mapper={({node}, next) => <Chart key={node.id} chart={node} hasNext={!!next} />}
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