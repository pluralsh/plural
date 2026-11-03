import { type styledTheme } from '@pluralsh/design-system'

import { Repository } from '../generated/graphql'

export const getRepoIcon = (
  repo: Nullable<Pick<Repository, 'icon' | 'darkIcon'>>,
  mode: typeof styledTheme.mode
) => (mode !== 'light' && repo?.darkIcon) || repo?.icon || ''
