import gql from 'graphql-tag'
import {DependenciesFragment} from './repo'

export const TerraformFragment = gql`
  fragment TerraformFragment on Terraform {
    id
    name
    readme
    package
    description
    dependencies {
      ...DependenciesFragment
    }
    valuesTemplate
  }
  ${DependenciesFragment}
`;