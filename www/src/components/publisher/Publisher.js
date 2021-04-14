import React, {useEffect, useContext} from 'react'
import {Box, Text} from 'grommet'
import {useQuery} from 'react-apollo'
import {useParams} from 'react-router-dom'
import { InputCollection, ResponsiveInputContainer } from 'forge-core'
import {PUBLISHER_Q} from './queries'
import Repositories from '../repos/Repositories'
import Avatar from '../users/Avatar'
import { DetailContainer } from '../repos/Installation'
import { BreadcrumbsContext } from '../Breadcrumbs'

function formatAddress({line1, line2, city, state, country, zip}) {
  return `${line1}, ${line2} ${city}, ${state}, ${country} ${zip}`
}

export function PublisherHeader({publisher: {name, description, owner}, size}) {
  return (
    <Box direction='row' align='center' gap='medium' pad='small'>
      <Avatar size={size || '80px'} user={owner} />
      <Box gap='small'>
        <Box>
          <Text size='medium' weight={500}>{name}</Text>
          <Text size='small'><i>{description}</i></Text>
        </Box>
      </Box>
    </Box>
  )
}

function PublisherView({name, owner, description, phone, address}) {
  return (
    <DetailContainer gap='small' pad='small'>
      <PublisherHeader publisher={{name, description, owner}} />
      <Box pad='small' border='top'>
        <InputCollection>
          <ResponsiveInputContainer label='email' content={<Text size='small'>{owner.email}</Text>} />
          <ResponsiveInputContainer label='phone' content={<Text size='small'>{phone}</Text>} />
          {address && <ResponsiveInputContainer label='address' content={<Text size='small'>{formatAddress(address)}</Text>} />}
        </InputCollection>
      </Box>
    </DetailContainer>
  )
}

function Publisher() {
  const {publisherId} = useParams()
  const {loading, data} = useQuery(PUBLISHER_Q, {variables: {publisherId}})
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
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
      <Box height='100%' width='60%'>
        <Repositories publisher={publisher} columns={2} />
      </Box>
      <Box width='40%' pad='small'>
        <PublisherView {...publisher} />
      </Box>
    </Box>
  )
}

export default Publisher