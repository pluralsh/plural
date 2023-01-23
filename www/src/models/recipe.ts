import { gql } from '@apollo/client'

import { ChartFragment } from './chart'
import { TerraformFragment } from './terraform'
import { InstallationFragment, RepoFragment } from './repo'

export const RecipeFragment = gql`
    fragment RecipeFragment on Recipe {
        id
        name
        description
        provider
        oidcEnabled
    }
`

export const RecipeItemFragment = gql`
  fragment RecipeItemFragment on RecipeItem {
    id
    chart { ...ChartFragment }
    terraform { ...TerraformFragment }
    configuration {
      name
      type
      default
      documentation
      placeholder
    }
  }
  ${ChartFragment}
  ${TerraformFragment}
`

export const RecipeSectionFragment = gql`
    fragment RecipeSectionFragment on RecipeSection {
        index
        repository {
            ...RepoFragment
            installation { ...InstallationFragment }
        }
        recipeItems { ...RecipeItemFragment }
        configuration {
            name
            default
            documentation
            type
            placeholder
            optional
            condition { operation field value }
            validation { type regex message }
        }
    }
    ${RepoFragment}
    ${RecipeItemFragment}
    ${InstallationFragment}
`
