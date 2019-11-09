import React, {useEffect, useContext} from 'react'
import {Box, Text} from 'grommet'
import {useQuery} from 'react-apollo'
import {useParams} from 'react-router-dom'
import {PUBLISHER_Q} from './queries'
import Repositories from '../repos/Repositories'
import Avatar from '../users/Avatar'
import {BreadcrumbContext} from '../Chartmart'

function PublisherView({name, owner, description}) {
  return (
    <Box gap='small' elevation='small' pad='small' direction='row'>
      <Avatar size='100px' user={owner} />
      <Box gap='small'>
        <Text size='medium'>{name}</Text>
        <Text size='small'>{description}</Text>
      </Box>
    </Box>
  )
}

function Publisher() {
  const {publisherId} = useParams()
  const {loading, data} = useQuery(PUBLISHER_Q, {variables: {publisherId}})
  const {setBreadcrumbs} = useContext(BreadcrumbContext)
  useEffect(() => {
    if (!data) return
    setBreadcrumbs([
      {url: `/publishers/${data.publisher.id}`, text: data.publisher.name}
    ])
  }, [setBreadcrumbs, data])
  if (loading || !data) return null

  const {publisher} = data
  return (
    <Box height='100%' direction='row' pad='medium'>
      <Box height='100%' width='60%' border='right'>
        <Repositories publisher={publisher} />
      </Box>
      <Box width='40%' pad='small'>
        <PublisherView {...publisher} />
      </Box>
    </Box>
  )
}

export default Publisher