import { type styledTheme } from '@pluralsh/design-system'
import { useRepositoryContext } from '../../contexts/RepositoryContext'
import { Repository } from '../../generated/graphql'
import InstallAppButton from '../utils/InstallAppButton'
import { RecipeSubset } from '../utils/recipeHelpers'

export function RepositoryActions() {
  const repository = useRepositoryContext()

  const recipes = repository?.recipes?.filter((recipe) => !!recipe) as
    | RecipeSubset[]
    | undefined

  return (
    <InstallAppButton
      loading={false}
      type="bundle"
      name={repository.name}
      recipes={recipes}
      width="100%"
    />
  )
}

export const getRepoIcon = (
  repo: Nullable<Pick<Repository, 'icon' | 'darkIcon'>>,
  mode: typeof styledTheme.mode
) => {
  return (mode !== 'light' && repo?.darkIcon) || repo?.icon || ''
}
