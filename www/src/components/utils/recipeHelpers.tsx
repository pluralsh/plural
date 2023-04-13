import { Sidecar } from '@pluralsh/design-system'
import { A } from 'honorable'
import { ReactNode, useState } from 'react'

import { Provider, Recipe } from '../../generated/graphql'

import { InstallCommandCopyButton } from './InstallCommandCopyButton'

export type RecipeSubset = Pick<Recipe, 'provider' | 'description'> &
  Partial<Pick<Recipe, 'name'>>

export type RecipeType = 'bundle' | 'stack'

export type InstallAppButtonProps = {
  loading: boolean
  recipes?: RecipeSubset[]
  name: string
  type: RecipeType
  apps?: string[]
  [x: string]: any
}

export const providerToIcon = {
  AWS: '/aws-icon.png',
  AZURE: '/azure.png',
  EQUINIX: '/equinix-metal.png',
  GCP: '/gcp.png',
  KIND: '/kind.png',
  GENERIC: '/chart.png',
}

export const providerToIconWidth = {
  AWS: 16,
  AZURE: 15,
  EQUINIX: 16,
  GCP: 16,
  KIND: 16,
  GENERIC: 16,
}

export const providerToLongName: Record<Provider, ReactNode> = {
  AWS: 'Amazon Web Services',
  AZURE: 'Microsoft Azure',
  EQUINIX: 'Equinix Metal',
  GCP: 'Google Cloud Platform',
  KIND: 'Kind',
  CUSTOM: 'Custom',
  KUBERNETES: 'Kubernetes',
  GENERIC: 'Generic',
}

export const providerToShortName: Record<Provider, ReactNode> = {
  AWS: 'AWS',
  AZURE: 'Azure',
  EQUINIX: 'Equinix',
  GCP: 'GCP',
  KIND: 'Kind',
  CUSTOM: 'Custom',
  KUBERNETES: 'Kubernetes',
  GENERIC: 'Generic',
}

export function getInstallCommand({
  type,
  name,
  recipe,
}: {
  type: RecipeType
  name: string
  recipe: RecipeSubset
}) {
  return `plural ${type} install ${name}${recipe.name ? ` ${recipe.name}` : ''}`
}

const MAX_RECIPES = 5

export function ProvidersSidecar({
  type,
  name,
  recipes,
}: {
  type: RecipeType
  name: string
  recipes?: RecipeSubset[]
}) {
  const [expanded, setExpanded] = useState(false)

  if (!recipes) {
    return null
  }
  const showViewMore = recipes.length > MAX_RECIPES && !expanded

  if (showViewMore) {
    recipes = recipes.slice(0, MAX_RECIPES - 1)
  }

  return (
    <Sidecar
      heading="Available providers"
      display="flex"
      flexDirection="column"
      gap="xxsmall"
    >
      {recipes?.map((recipe, i) => {
        if (!recipe) {
          return null
        }

        return (
          <InstallCommandCopyButton
            name={name}
            type={type}
            key={recipe?.name ?? i}
            recipe={recipe}
          />
        )
      })}
      {showViewMore && (
        <A
          inline
          onClick={() => setExpanded(true)}
        >
          View more
        </A>
      )}
    </Sidecar>
  )
}
