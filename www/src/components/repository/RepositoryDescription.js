import { useContext } from 'react'
import { Flex, P } from 'honorable'

import RepositoryContext from '../../contexts/RepositoryContext'

import RepositoryDescriptionMarkdown from './RepositoryDescriptionMarkdown'

function RepositoryDescription() {
  const repository = useContext(RepositoryContext)

  return (
    <Flex
      direction="column"
      backgroundColor="fill-one"
      color="text-light"
      border="1px solid border"
      padding="medium"
      paddingBottom="xlarge"
      borderRadius="large"
      maxWidth="640px"
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
