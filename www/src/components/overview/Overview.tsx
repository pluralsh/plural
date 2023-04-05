import { ReactElement } from 'react'
import { Outlet } from 'react-router-dom'
import { Flex } from 'honorable'

import OverviewHeader from './OverviewHeader'

export function Overview(): ReactElement {
  return (
    <Flex
      direction="column"
      grow={1}
      padding="large"
    >
      <OverviewHeader />
      <Outlet />
    </Flex>
  )
}
