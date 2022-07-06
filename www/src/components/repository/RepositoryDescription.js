import { useContext } from 'react'
import { Flex, H2, P } from 'honorable'

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
      maxWidth="768px"
    >
      <H2
        overline
        marginBottom="xxsmall"
      >
        Description
      </H2>
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
