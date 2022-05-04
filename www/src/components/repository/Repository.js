import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { Div } from 'honorable'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { REPO_Q } from '../repos/queries'

import RepositoryHeader from './RepositoryHeader'

function Repository() {
  const { id } = useParams()
  const { data } = useQuery(REPO_Q, {
    variables: { repositoryId: id },
    fetchPolicy: 'cache-and-network',
  })

  if (!data) {
    return (
      <Div
        pt={12}
        xflex="x5"
      >
        <LoopingLogo />
      </Div>
    )
  }

  const { repository } = data

  return (
    <Div
      pt={2}
      pb={4}
      px={4}
    >
      <RepositoryHeader repository={repository} />
    </Div>
  )
}

export default Repository
