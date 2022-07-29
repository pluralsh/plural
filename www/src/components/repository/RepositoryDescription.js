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
      paddingRight="small"
      borderRadius="large"
      position="relative"
      overflowY="hidden"
    >
      <RepositoryHeader>Readme</RepositoryHeader>
      <Flex
        direction="column"
        flexGrow={1}
        overflowY="auto"
        paddingTop="medium"
        paddingBottom="xlarge"
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
