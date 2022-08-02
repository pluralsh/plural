import { useContext } from 'react'
import { Flex, P } from 'honorable'
import { PageTitle } from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'

import RepositoryDescriptionMarkdown from './RepositoryDescriptionMarkdown'

function RepositoryDescription() {
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
      />
      <Flex
        direction="column"
        flexGrow={1}
        overflowY="auto"
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
