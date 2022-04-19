import { useContext, useEffect } from 'react'
import { Box, Text } from 'grommet'
import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { InputCollection, ResponsiveInputContainer } from 'forge-core'

import Repositories from '../repos/Repositories'
import Avatar from '../users/Avatar'
import { DetailContainer } from '../repos/Installation'
import { BreadcrumbsContext } from '../Breadcrumbs'

import { PUBLISHER_Q } from './queries'

function formatAddress({ line1, line2, city, state, country, zip }) {
  return `${line1}, ${line2} ${city}, ${state}, ${country} ${zip}`
}

export function PublisherHeader({ publisher: { name, description, ...publisher }, size }) {
  return (
    <Box
      direction="row"
      align="center"
      gap="medium"
      pad="small"
    >
      <Avatar
        size={size || '80px'}
        user={{ ...publisher, name }}
      />
      <Box gap="small">
        <Box>
          <Text
            size="medium"
            weight={500}
          >{name}
          </Text>
          <Text size="small"><i>{description}</i></Text>
        </Box>
      </Box>
    </Box>
  )
}

function PublisherView({ publisher: { name, description, phone, owner, address, ...publisher } }) {
  const showDetails = !!address

  return (
    <DetailContainer
      gap="small"
      pad="small"
    >
      <PublisherHeader publisher={{ ...publisher, name, description }} />
      {showDetails && (
        <Box
          pad="small"
          border="top"
        >
          <InputCollection>
            <ResponsiveInputContainer
              label="address"
              content={<Text size="small">{formatAddress(address)}</Text>}
            />
          </InputCollection>
        </Box>
      )}
    </DetailContainer>
  )
}

export default function Publisher() {
  const { publisherId } = useParams()
  const { loading, data } = useQuery(PUBLISHER_Q, { variables: { publisherId } })
  const { setBreadcrumbs } = useContext(BreadcrumbsContext)
  useEffect(() => {
    if (!data) return
    setBreadcrumbs([
      { url: `/publishers/${data.publisher.id}`, text: data.publisher.name },
    ])
  }, [setBreadcrumbs, data])
  if (loading || !data) return null

  const { publisher } = data

  return (
    <Box
      height="100%"
      direction="row"
      pad="medium"
    >
      <Box
        height="100%"
        width="60%"
      >
        <Repositories
          publisher={publisher}
          columns={2}
        />
      </Box>
      <Box
        width="40%"
        pad="small"
      >
        <PublisherView publisher={publisher} />
      </Box>
    </Box>
  )
}
