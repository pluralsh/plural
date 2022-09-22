import { RepoCardList } from 'components/marketplace/RepoCardList'
import { Flex, P } from 'honorable'
import { PageTitle } from 'pluralsh-design-system'
import { useOutletContext } from 'react-router-dom'

import { StackActions } from './misc'

import { StackContext } from './types'

export default function StackApps() {
  const { stack }: StackContext = useOutletContext()

  return (
    <Flex
      direction="column"
      paddingRight="small"
      borderRadius="large"
      position="relative"
      overflowY="hidden"
    >
      <PageTitle
        heading="Stack applications"
        paddingTop="medium"
      >
        <Flex display-desktop-up="none"><StackActions stack={stack} /></Flex>
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
        <P
          body1
          marginBottom="medium"
        >
          {stack?.description}
        </P>
        <RepoCardList
          repositories={stack?.bundles?.map(({ repository }) => repository)}
          urlParams={`backStackName=${stack.name}`}
          mx={-0.75}
        />
      </Flex>
    </Flex>
  )
}
