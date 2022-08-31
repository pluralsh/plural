import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { PUBLISHER_QUERY } from './queries'

function Publisher() {
  const { publisherId } = useParams()
  const { loading, data } = useQuery(PUBLISHER_QUERY, { variables: { publisherId } })

  const { publisher } = data

  console.log('publisher', publisher)

  return (
    <>
      foo
    </>
  )
}

export default Publisher
