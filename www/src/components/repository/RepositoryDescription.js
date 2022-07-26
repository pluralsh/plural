import { useContext } from 'react'
import { Flex, P } from 'honorable'

import RepositoryContext from '../../contexts/RepositoryContext'

import RepositoryDescriptionMarkdown from './RepositoryDescriptionMarkdown'

import RepositoryHeader from './RepositoryHeader.tsx'

function RepositoryDescription() {
  const repository = useContext(RepositoryContext)

  return (
    <Flex
      direction="column"
      color="text-light"
      paddingBottom="xlarge"
      borderRadius="large"
      position="relative"
    >
      <RepositoryHeader>Readme</RepositoryHeader>
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
