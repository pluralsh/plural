import {
  Div, Flex, Hr, P,
} from 'honorable'

import { RepositorySideCarCollapsed } from './RepositorySideCar'

function RepositoryHeader({ children, ...props }: any) {
  return (
    <Div
      width="100%"
      position="sticky"
      top={0}
      {...props}
    >
      <Div
        width="100%"
        backgroundColor="fill-zero"
        paddingTop="large"
      >
        <Flex
          align="center"
          justifyContent="space-between"
        >
          <P title1>
            {children}
          </P>
          <RepositorySideCarCollapsed display-desktop-up="none" />
        </Flex>
        <Hr
          marginTop={18}
          marginBottom={0}
        />
      </Div>
    </Div>
  )
}

export default RepositoryHeader
