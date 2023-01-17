import { gql } from '@apollo/client'

export const SHELL_CONFIGURATION_QUERY = gql`
    query ShellConfiguration {
        shellConfiguration {
            contextConfiguration
            workspace {
                bucketPrefix
                cluster
                network {
                    pluralDns
                    subdomain
                }
            }
        }
    }
`
