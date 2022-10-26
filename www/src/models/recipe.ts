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
  }
  ${RepoFragment}
  ${RecipeItemFragment}
  ${InstallationFragment}
`
