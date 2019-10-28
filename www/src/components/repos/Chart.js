import React from 'react'
import {Box, Text, Table, TableHeader, TableRow, TableBody, TableCell, Anchor} from 'grommet'
import {useQuery} from 'react-apollo'
import {useParams, useHistory} from 'react-router-dom'
import Scroller from '../utils/Scroller'
import {CHART_Q} from './queries'
import moment from 'moment'

function ChartVersion({version}) {
  let history = useHistory()
  return (
    <Box direction='row' align='center' gap='xsmall'>
      <Anchor size='small' onClick={() => history.push(`/charts/${version.chart.id}/${version.version}`)}>
        {version.version}
      </Anchor> - <Text size='small'>{moment(version.helm.created).fromNow()}</Text>
    </Box>
  )
}

function ChartView({helm, chart}) {
  return (
    <Box gap='small'>
      <Text size='medium'>{chart.name}</Text>
      <Text size='small'><i>{helm.description}</i></Text>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell scope="col" border="bottom">
              Name
            </TableCell>
            <TableCell scope="col" border="bottom">
              Value
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell scope="row">
              <strong>App Version</strong>
            </TableCell>
            <TableCell>{helm.appVersion}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell scope="row">
              <strong>Digest</strong>
            </TableCell>
            <TableCell>{helm.digest}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell scope="row">
              <strong>Created</strong>
            </TableCell>
            <TableCell>{moment(helm.created).fromNow()}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  )
}

function Chart() {
  const {chartId} = useParams()
  const {loading, data, fetchMore} = useQuery(CHART_Q, {variables: {chartId}})
  if (loading || !data) return null

  const {edges, pageInfo} = data.versions
  return (
    <Box pad='small' direction='row'>
      <Box width='70%' pad='small' border='right'>
        <ChartView {...edges[0].node} />
      </Box>
      <Box pad='small' width='30%'>
        <Box elevation='small' gap='xsmall' pad='small'>
          <Text size='small'>Versions</Text>
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
        </Box>
    </Box>
  )
}

export default Chart