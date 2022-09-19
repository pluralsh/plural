import { Flex } from 'honorable'
import { PageTitle } from 'pluralsh-design-system'
import { useOutletContext } from 'react-router-dom'

export default function StackApps() {
  const { stack }: any = useOutletContext()

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
        {/* <Flex display-desktop-up="none"><RepositoryActions /></Flex> */}
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
        {stack.description}
      </Flex>
    </Flex>
  )
}
