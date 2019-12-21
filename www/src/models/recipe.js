import gql from 'graphql-tag'
import { ChartFragment } from './chart'
import { TerraformFragment } from './terraform'
import { RepoFragment } from './repo';

export const RecipeFragment = gql`
  fragment RecipeFragment on Recipe {
    id
    name
    description
  }
`;

export const RecipeItemFragment = gql`
  fragment RecipeItemFragment on RecipeItem {
    id
    chart {
      ...ChartFragment
    }
    terraform {
      ...TerraformFragment
    }
    configuration {
      name
      default
      type
    }
  }
  ${ChartFragment}
  ${TerraformFragment}
`;

export const RecipeSectionFragment = gql`
  fragment RecipeSectionFragment on RecipeSection {
    index
    repository {
      ...RepoFragment
    }
    recipeItems {
      ...RecipeItemFragment
    }
  }
  ${RepoFragment}
  ${RecipeItemFragment}
`;