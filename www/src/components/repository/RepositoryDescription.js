import { useContext } from 'react'
import { Flex, P } from 'honorable'

import RepositoryContext from '../../contexts/RepositoryContext'

import RepositoryDescriptionMarkdown from './RepositoryDescriptionMarkdown'

import RepositoryHeader from './RepositoryHeader.tsx'

export default function RepositoryDescription() {
  const repository = useContext(RepositoryContext)

  return (
    <Flex
      direction="column"
      color="text-light"
      position="relative"
      overflowY="hidden"
    >
      <RepositoryHeader>Readme</RepositoryHeader>
      <Flex
        direction="column"
        flexGrow={1}
        overflowY="auto"
        marginTop="medium"
        marginBottom="medium"
        paddingRight="small"
      >
        {repository.readme ? (
          <RepositoryDescriptionMarkdown
            text={repository.readme}
            gitUrl={repository.git_url}
          />
        ) : <P>This repository does not have a Readme yet.</P>}
      </Flex>
    </Flex>
  )
}
