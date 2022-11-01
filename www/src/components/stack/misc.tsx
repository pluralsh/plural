import InstallDropdownButton, { Recipe } from '../utils/InstallDropdownButton'

import { StackContext } from './types'

export function StackActions({ stack }: StackContext) {
  const recipes = stack?.collections?.map(({ name, provider }) => ({
    name,
    description: `Installs ${stack.displayName || stack.name} on ${provider}`,
    provider,
  } as Recipe))

  return (
    <InstallDropdownButton
      name={stack.name}
      recipes={recipes}
      type="stack"
      width="100%"
    />
  )
}
