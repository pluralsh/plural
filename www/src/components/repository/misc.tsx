import { useRepositoryContext } from '../../contexts/RepositoryContext'
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
