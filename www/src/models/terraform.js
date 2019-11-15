import gql from 'graphql-tag'

export const TerraformFragment = gql`
  fragment TerraformFragment on Terraform {
    id
    name
    readme
    package
    description
    dependencies
    valuesTemplate
  }
`;