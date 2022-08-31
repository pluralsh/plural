import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { Flex } from 'honorable'

import Marketplace from 'components/marketplace/Marketplace'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { PUBLISHER_QUERY } from './queries'

function Publisher() {
  const { id } = useParams()
  const { data } = useQuery(PUBLISHER_QUERY, { variables: { publisherId: id } })

  if (!data) {
    return (
      <Flex
        pt={2}
        align="center"
        justify="center"
        flexGrow={1}
      >
        <LoopingLogo />
      </Flex>
    )
  }

  const { publisher } = data

  console.log('publisher', publisher)

  return (
    <Marketplace publisher={publisher} />
  )
}

export default Publisher
