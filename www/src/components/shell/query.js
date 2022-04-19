import { gql } from '@apollo/client'

import { CloudShellFragment } from '../../models/shell'

export const AUTH_URLS = gql`
  query {
    scmAuthorization { provider url }
  }
`

export const SCM_TOKEN = gql`
  query Token($provider: ScmProvider!, $code: String!) {
    scmToken(provider: $provider, code: $code)
  }
`

export const CLOUD_SHELL = gql`
  query {
    shell { ...CloudShellFragment }
  }
  ${CloudShellFragment}
`

export const CREATE_SHELL = gql`
  mutation Create($attributes: CloudShellAttributes!) {
    createShell(attributes: $attributes) { ...CloudShellFragment }
  }
  ${CloudShellFragment}
`

export const REBOOT_SHELL = gql`
  mutation {
    rebootShell { ...CloudShellFragment }
  }
  ${CloudShellFragment}
`
