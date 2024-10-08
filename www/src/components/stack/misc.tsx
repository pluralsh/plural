import {
  StackCollection,
  StackCollectionFragment,
} from '../../generated/graphql'
import InstallAppButton from '../utils/InstallAppButton'
import { RecipeSubset } from '../utils/recipeHelpers'

import { StackContext } from './types'

export function StackActions({
  stack,
  recipes,
}: StackContext & { recipes?: RecipeSubset[] }) {
  const filteredCollections = stack?.collections?.filter(
    (
      sC: StackCollectionFragment | null | undefined
    ): sC is StackCollectionFragment => !!sC
  )

  const apps = filteredCollections?.[0].bundles
    ?.map((bundle) => bundle?.recipe?.repository?.name)
    .filter((appName: string | undefined): appName is string => !!appName)

  return (
    <InstallAppButton
      loading={false}
      name={stack.name}
      recipes={recipes}
      apps={apps}
      type="stack"
      width="100%"
    />
  )
}
