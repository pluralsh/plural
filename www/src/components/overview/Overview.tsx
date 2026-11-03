import { Flex } from '@pluralsh/design-system'
import { ReactElement, Suspense } from 'react'

import LoadingIndicator from '../utils/LoadingIndicator'
import { Outlet } from 'react-router-dom'

export function Overview(): ReactElement {
  return (
    <Flex
      direction="column"
      grow={1}
      padding="large"
      overflowY="auto"
    >
      <Suspense fallback={<LoadingIndicator />}>
        <Outlet />
      </Suspense>
    </Flex>
  )
}
