import { Sidecar } from '@pluralsh/design-system'
import { ReactNode } from 'react'

import { Provider, Recipe } from '../../generated/graphql'

import { InstallCommandCopyButton } from './InstallCommandCopyButton'

export type RecipeSubset = Pick<Recipe, 'provider' | 'description'> &
  Partial<Pick<Recipe, 'name'>>

export type RecipeType = 'bundle' | 'stack'

export type InstallDropDownButtonProps = {
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

export function ProvidersSidecar({
  type,
  name,
  recipes,
}: {
  type: RecipeType
  name: string
  recipes?: RecipeSubset[]
}) {
  if (!recipes) {
    return null
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
    </Sidecar>
  )
}
