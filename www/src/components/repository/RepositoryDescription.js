import { useContext } from 'react'
import { Flex, P } from 'honorable'

import RepositoryContext from '../../contexts/RepositoryContext'

import RepositoryDescriptionMarkdown from './RepositoryDescriptionMarkdown'

function RepositoryDescription() {
  const repository = useContext(RepositoryContext)

  return (
    <Flex
      direction="column"
      color="text-light"
      padding="medium"
      paddingBottom="xlarge"
      borderRadius="large"
    >
      {repository.readme ? (
        <RepositoryDescriptionMarkdown
          text={repository.readme}
          gitUrl={repository.git_url}
        />
      ) : <P>No description available</P>}
    </Flex>
  )
}

export default RepositoryDescription
