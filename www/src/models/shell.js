import { gql } from '@apollo/client'

export const CloudShellFragment = gql`
  fragment CloudShellFragment on CloudShell {
    id
    gitUrl
    alive
    provider
    status {
      ready
      initialized
      containersReady
      podScheduled
    }
  }
`
