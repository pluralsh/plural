import { Flex } from 'honorable'
import { ReactElement } from 'react'
import { Outlet } from 'react-router-dom'

export function Overview(): ReactElement {
  return (
    <Flex
      direction="column"
      grow={1}
      padding="large"
      overflowY="auto"
    >
      <Outlet />
    </Flex>
  )
}
