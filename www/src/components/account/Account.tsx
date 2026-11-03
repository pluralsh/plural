import { PageCard, useSetBreadcrumbs } from '@pluralsh/design-system'
import { useContext, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import CurrentUserContext from '../../contexts/CurrentUserContext'
import { SubpageLayout } from '../utils/layout/SubpageLayout'

const DIRECTORY = [
  { path: '/account/edit', label: 'General' },
  { path: '/account/users', label: 'Users' },
  { path: '/account/service-accounts', label: 'Service accounts' },
  { path: '/account/groups', label: 'Groups' },
  { path: '/account/roles', label: 'Roles' },
  { path: '/account/domains', label: 'DNS domains' },
]

const CRUMB_LABELS: Record<string, string> = {
  edit: 'general',
  'service-accounts': 'service accounts',
  domains: 'dns domains',
}

export function Account() {
  const me = useContext(CurrentUserContext)
  const orgName = me.account?.name || ''
  const params = useParams()
  const subPath = params?.['*']?.split?.('/')[0]
  const breadcrumbs = useMemo(
    () => [
      { label: 'organization', url: '/account' },
      ...(subPath
        ? [
            {
              label: CRUMB_LABELS[subPath] ?? subPath,
              url: `/account/${subPath}`,
            },
          ]
        : []),
    ],
    [subPath]
  )

  useSetBreadcrumbs(breadcrumbs)

  return (
    <SubpageLayout
      directory={DIRECTORY}
      tile={
        <PageCard
          heading={orgName}
          icon={{
            name: orgName,
            initials: orgName.charAt(0).toUpperCase() || '?',
          }}
        />
      }
    />
  )
}
