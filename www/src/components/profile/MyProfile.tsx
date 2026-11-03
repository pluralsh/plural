import { PageCard, useSetBreadcrumbs } from '@pluralsh/design-system'
import { useContext } from 'react'

import CurrentUserContext from '../../contexts/CurrentUserContext'
import { SubpageLayout } from '../utils/layout/SubpageLayout'

const DIRECTORY = [
  { path: '/profile/me', label: 'Profile' },
  { path: '/profile/appearance', label: 'Appearance' },
  { path: '/profile/security', label: 'Security' },
  { path: '/profile/tokens', label: 'Access tokens' },
  { path: '/profile/encryption-keys', label: 'Encryption keys' },
  { path: '/profile/keys', label: 'Public keys' },
  { path: '/profile/eab', label: 'EAB credentials' },
]

export const profileCrumbs = [{ label: 'profile', url: '/profile' }]

export function MyProfile() {
  const me = useContext(CurrentUserContext)
  const orgName = me.account?.name

  useSetBreadcrumbs(profileCrumbs)

  return (
    <SubpageLayout
      directory={DIRECTORY}
      tile={
        <PageCard
          heading={me.name}
          icon={{ name: me.name, url: me.avatar, spacing: 'none' }}
          subheading={
            me.roles?.admin
              ? `Admin${orgName ? ` at ${orgName}` : ''}`
              : undefined
          }
        />
      }
    />
  )
}
