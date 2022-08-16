import { useContext } from 'react'
import { Flex, P } from 'honorable'
import { Markdown, PageTitle } from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'

export default function RepositoryDescription() {
  const repository = useContext(RepositoryContext)

  return (
    <Flex
      direction="column"
      paddingRight="small"
      borderRadius="large"
      color="text-light"
      position="relative"
      overflowY="hidden"
    >
      <PageTitle
        heading="Readme"
        paddingTop="medium"
      />
      <Flex
        direction="column"
        flexGrow={1}
        overflowY="auto"
        paddingBottom="xlarge"
        marginBottom="medium"
        paddingRight="small"
      >
        {repository.readme ? (
          <Markdown
            text={repository.readme}
            gitUrl={repository.git_url}
          />
        ) : <P>This repository does not have a Readme yet.</P>}
      </Flex>
    </Flex>
  )
}
