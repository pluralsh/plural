import React, {useEffect, useContext} from 'react'
import {Box, Text} from 'grommet'
import {useQuery} from 'react-apollo'
import {useParams} from 'react-router-dom'
import {PUBLISHER_Q} from './queries'
import Repositories from '../repos/Repositories'
import Avatar from '../users/Avatar'
import {BreadcrumbContext} from '../Forge'
import { InputCollection, ResponsiveInputContainer } from '../utils/InputField'
import { DetailContainer } from '../repos/Installation'

function formatAddress({line1, line2, city, state, country, zip}) {
  return `${line1}, ${line2} ${city}, ${state}, ${country} ${zip}`
}

function PublisherView({name, owner, description, phone, address}) {
  return (
    <DetailContainer gap='small' pad='small'>
      <Box direction='row' align='center' gap='small' pad='small'>
        <Avatar size='100px' user={owner} />
        <Box gap='small'>
          <Box>
            <Text size='medium'>{name}</Text>
            <Text size='small'><i>{description}</i></Text>
          </Box>
        </Box>
      </Box>
      <Box pad='small'>
        <InputCollection>
          <ResponsiveInputContainer label='email' content={<Text size='small'>{owner.email}</Text>} />
          <ResponsiveInputContainer label='phone' content={<Text size='small'>{phone}</Text>} />
          <ResponsiveInputContainer label='address' content={<Text size='small'>{formatAddress(address)}</Text>} />
        </InputCollection>
      </Box>
    </DetailContainer>
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