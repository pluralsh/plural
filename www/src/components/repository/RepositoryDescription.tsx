import { useContext } from 'react'
import { Flex, P } from 'honorable'
import { Markdown, PageTitle } from '@pluralsh/design-system'

import RepositoryContext from '../../contexts/RepositoryContext'

import { RepositoryActions } from './misc'

export default function RepositoryDescription() {
  const repository = useContext(RepositoryContext)

  return (
    <Flex
      direction="column"
      paddingRight="small"
      borderRadius="large"
      position="relative"
      overflowY="hidden"
    >
      <PageTitle
        heading="Readme"
        paddingTop="medium"
      >
        <Flex display-desktop-up="none"><RepositoryActions /></Flex>
      </PageTitle>
      <Flex
        direction="column"
        flexGrow={1}
        overflowY="auto"
        color="text-light"
        paddingBottom="xlarge"
        marginBottom="medium"
        paddingRight="small"
      >
        {repository.readme ? (
          <Markdown
            text={repository.readme}
            gitUrl={repository.gitUrl}
            mainBranch={repository.mainBranch}
          />
        ) : <P>This repository does not have a Readme yet.</P>}
      </Flex>
    </Flex>
  )
}
