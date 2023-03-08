import { StackCollection } from '../../generated/graphql'
import InstallDropdownButton from '../utils/InstallDropdownButton'

import { StackContext } from './types'

export function StackActions({ stack }: StackContext) {
  const filteredCollections = stack?.collections?.filter((sC: StackCollection | null | undefined): sC is StackCollection => !!sC)
  const recipes = filteredCollections?.map(({ provider }) => ({
    description: `Installs ${stack.displayName || stack.name} on ${provider}`,
    provider,
  }))

  const apps = filteredCollections?.[0].bundles
    ?.map(bundle => bundle?.recipe?.repository?.name)
    .filter((appName: string | undefined): appName is string => !!appName)

  return (
    <InstallDropdownButton
      loading={false}
      name={stack.name}
      recipes={recipes}
      apps={apps}
      type="stack"
      width="100%"
    />
  )
}
