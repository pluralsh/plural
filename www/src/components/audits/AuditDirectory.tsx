import { useSetBreadcrumbs } from '@pluralsh/design-system'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { SubpageLayout } from '../utils/layout/SubpageLayout'

const DIRECTORY = [
  { path: '/audits/logs', label: 'Audit logs' },
  { path: '/audits/logins', label: 'Logins' },
  { path: '/audits/geo', label: 'Geodistribution' },
]

export function AuditDirectory() {
  const params = useParams()
  const subPath = params?.['*']?.split?.('/')[0]
  const breadcrumbs = useMemo(
    () => [
      { label: 'audits', url: '/audits' },
      ...(subPath ? [{ label: subPath, url: `/audits/${subPath}` }] : []),
    ],
    [subPath]
  )

  useSetBreadcrumbs(breadcrumbs)

  return (
    <SubpageLayout
      narrow
      directory={DIRECTORY}
    />
  )
}
