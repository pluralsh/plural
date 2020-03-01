import React, {useContext, useEffect} from 'react'
import {Box, Text, Anchor} from 'grommet'
import {useQuery} from 'react-apollo'
import {useHistory} from 'react-router-dom'
import Scroller from '../utils/Scroller'
import {PUBLISHERS_Q} from './queries'
import Avatar from '../users/Avatar'
import {BreadcrumbContext} from '../Chartmart'


function Publisher({publisher}) {
  let history = useHistory()
  const {setBreadcrumbs} = useContext(BreadcrumbContext)
  useEffect(() => {
    setBreadcrumbs([])
  }, [setBreadcrumbs])

  return (
    <Box direction='row' gap='small' align='center'>
      <Avatar size='65px' user={publisher.owner} />
      <Box>
        <Anchor
          onClick={() => history.push(`/publishers/${publisher.id}`)}
          size='small'
          weight='bold'>
          {publisher.name}
        </Anchor>
        <Text size='small'><i>{publisher.description}</i></Text>
        <Text size='small'>owner: {publisher.owner.name}</Text>
      </Box>
    </Box>
  )
}

export default function Publishers() {
  const {loading, data, fetchMore} = useQuery(PUBLISHERS_Q)
  if (loading || !data) return null

  const {edges, pageInfo} = data.publishers
  return (
    <Box gap='small' pad='medium'>
      <Scroller
        id='publishers'
        edges={edges}
        style={{overflow: 'auto', height: '100%', width: '100%'}}
        mapper={({node}) => <Publisher publisher={node} />}
        onLoadMore={() => pageInfo && fetchMore({
          variables: {cursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult: {publishers: {edges, pageInfo}}}) => {
            return {...prev, publishers: {
                ...prev.publishers,
                pageInfo,
                edges: [...prev.publishers.edges, ...edges]
              }
            }
          }
        })} />
    </Box>
  )
}