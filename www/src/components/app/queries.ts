import { gql } from '@apollo/client'

import { InstallationFragment, RepoFragment } from '../../models/repo'

export const REPO_Q = gql`
  query Repo($name: String!) {
    repository(name: $name) {
      ...RepoFragment
      installation {
        ...InstallationFragment
      }
    }
  }

  ${RepoFragment}
  ${InstallationFragment}
`
