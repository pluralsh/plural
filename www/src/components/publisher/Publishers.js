import React, { useContext, useEffect, useState, useRef } from 'react'
import { Box, Text, Anchor, Drop } from 'grommet'
import { useQuery } from 'react-apollo'
import { useHistory } from 'react-router-dom'
import Scroller from '../utils/Scroller'
import { PUBLISHERS_Q } from './queries'
import Avatar from '../users/Avatar'
import { BreadcrumbContext } from '../Forge'
import { Container } from '../repos/Integrations'


const STUB_ICON_SIZE = '20px'

function RepoStub({id, icon, name}) {
  const dropRef = useRef()
  const [hover, setHover] = useState(false)
  let history = useHistory()

  return (
    <Box
      ref={dropRef}
      style={{cursor: 'pointer'}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => history.push(`/publishers/${id}`)}
      align='center'
      justify='center'>
      <img height={STUB_ICON_SIZE} width={STUB_ICON_SIZE} src={icon} alt={name} />
      {hover && (
        <Drop target={dropRef.current} align={{bottom: 'top'}} plain>
          <Box background='#222222' pad={{vertical: 'xsmall', horizontal: 'small'}} round='xsmall'>
            {name}
          </Box>
        </Drop>
      )}
    </Box>
  )
}

function Publisher({publisher: {id, name, owner, description, repositories}}) {
  let history = useHistory()

  return (
    <Container
      style={{cursor: 'pointer'}}
      direction='row'
      gap='small'
      onClick={() => history.push(`/publishers/${id}`)}>
      <Avatar size='65px' user={owner} />
      <Box>
        <Anchor onClick={() => history.push(`/publishers/${id}`)} size='small' weight='bold'>
          {name}
        </Anchor>
        <Text size='small'><i>{description}</i></Text>
        <Box direction='row' gap='xsmall' margin={{top: 'xsmall'}}>
          {repositories.map(({id, icon, name}) => <RepoStub key={id} id={id} icon={icon} name={name} />)}
        </Box>
      </Box>
    </Container>
  )
}

export default function Publishers() {
  const {loading, data, fetchMore} = useQuery(PUBLISHERS_Q)
  const {setBreadcrumbs} = useContext(BreadcrumbContext)
  useEffect(() => {
    setBreadcrumbs([])
  }, [setBreadcrumbs])

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