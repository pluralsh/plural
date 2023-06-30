import { gql } from '@apollo/client'

import {
  FileContentFragment,
  InstallationFragment,
  RepoFragment,
} from '../../models/repo'
import { OIDCProvider } from '../../models/oauth'

export const REPO_Q = gql`
  query Repo($name: String!) {
    repository(name: $name) {
      ...RepoFragment
      docs {
        ...FileContentFragment
      }
      editable
      upgradeChannels
      installation {
        ...InstallationFragment
        oidcProvider {
          ...OIDCProvider
        }
      }
    }
  }
  ${RepoFragment}
  ${FileContentFragment}
  ${InstallationFragment}
  ${OIDCProvider}
`
