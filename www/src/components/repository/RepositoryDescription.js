import { useContext } from 'react'
import { Flex, H2, P } from 'honorable'

import RepositoryContext from '../../contexts/RepositoryContext'

import RepositoryDescriptionMarkdown from './RepositoryDescriptionMarkdown'

function RepositoryDescription() {
  const repository = useContext(RepositoryContext)

  return (
    <Flex
      direction="column"
      height="100%"
    >
      <H2>
        Description
      </H2>
      <Flex
        mt={2}
        pb={8}
        direction="column"
        flexGrow={1}
        maxWidth="700px"
      >
        {repository.readme ? (
          <RepositoryDescriptionMarkdown
            text={repository.readme}
            gitUrl={repository.git_url}
          />
        ) : <P>No description available</P>}
      </Flex>
    </Flex>
  )
}

export default RepositoryDescription
