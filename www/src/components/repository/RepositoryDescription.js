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
            // TODO: add support for mainBranch argument
            // Linear: https://linear.app/pluralsh/issue/ENG-504/add-mainbranch-argument-to-markdown-component-in-the-design-system
            // mainBranch={repository.mainBranch}
          />
        ) : <P>No description available</P>}
      </Flex>
    </Flex>
  )
}
