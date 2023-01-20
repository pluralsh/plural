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
                network {
                    pluralDns
                    subdomain
                }
            }
        }
    }
`
