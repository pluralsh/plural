import { gql } from '@apollo/client'

export const SHELL_CONFIGURATION_QUERY = gql`
    query ShellConfiguration {
        shellConfiguration {
            contextConfiguration
            git {
                url
            }
            workspace {
                bucketPrefix
                cluster
                region
                network {
                    pluralDns
                    subdomain
                }
            }
        }
    }
`

export const UPDATE_SHELL_MUTATION = gql`
  mutation UpdateShell($attributes: CloudShellAttributes!) {
    updateShell(attributes: $attributes) {
            id
    }
  }
`
