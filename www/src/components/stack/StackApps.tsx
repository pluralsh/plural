import { Flex, P } from 'honorable'
import { useOutletContext } from 'react-router-dom'

import { RepoCardList } from '../marketplace/RepoCardList'

import { ScrollablePage } from '../utils/layout/ScrollablePage'

import { StackActions } from './misc'

import { StackContext } from './types'

export default function StackApps() {
  const { stack }: StackContext = useOutletContext()
  const repositories
    = stack.collections?.length > 0
      ? stack.collections[0].bundles?.map(b => b.recipe.repository)
      : []

  return (
    <ScrollablePage
      heading="Stack applications"
      headingContent={(
        <Flex display-desktop-up="none">
          <StackActions stack={stack} />
        </Flex>
      )}
    >
      <P
        body1
        marginBottom="medium"
      >
        {stack?.description}
      </P>
      <RepoCardList
        repositories={repositories}
        urlParams={`backStackName=${stack.name}`}
      />
    </ScrollablePage>
  )
}
