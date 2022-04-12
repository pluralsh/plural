import { gql } from '@apollo/client'

import { DependenciesFragment } from './repo'

export const TerraformFragment = gql`
  fragment TerraformFragment on Terraform {
    id
    name
    readme
    package
    description
    latestVersion
    dependencies { ...DependenciesFragment }
    valuesTemplate
  }
  ${DependenciesFragment}
`

export const TerraformInstallationFragment = gql`
  fragment TerraformInstallationFragment on TerraformInstallation {
    id
    terraform { ...TerraformFragment }
    version { id version }
  }
  ${TerraformFragment}
`
