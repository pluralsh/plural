import { gql } from '@apollo/client'

import { InstallationFragment, RepoFragment } from '../../models/repo'
import { OIDCProvider } from '../../models/oauth'

export const REPO_Q = gql`
  query Repo($name: String!) {
    repository(name: $name) {
      ...RepoFragment
      upgradeChannels
      installation {
        ...InstallationFragment
        oidcProvider { ...OIDCProvider }
      }
    }
  }

  ${RepoFragment}
  ${InstallationFragment}
  ${OIDCProvider}
`
