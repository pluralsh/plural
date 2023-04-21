import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { useSetBreadcrumbs } from '@pluralsh/design-system'

import Marketplace from '../marketplace/Marketplace'

import LoadingIndicator from '../utils/LoadingIndicator'

import { PUBLISHER_QUERY } from './queries'

const breadcrumbs = [{ label: 'publisher' }]

function Publisher() {
  const { id } = useParams()
  const { data } = useQuery(PUBLISHER_QUERY, { variables: { publisherId: id } })

  useSetBreadcrumbs(breadcrumbs)
  if (!data) {
    return <LoadingIndicator />
  }

  const { publisher } = data

  return (
    <Marketplace publisher={publisher} />
  )
}

export default Publisher
