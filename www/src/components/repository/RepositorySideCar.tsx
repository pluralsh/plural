import { Button, ButtonProps, Flex } from 'honorable'
import {
  BrowserIcon,
  CertificateIcon,
  GitHubLogoIcon,
  Sidecar,
} from '@pluralsh/design-system'

import { forwardRef } from 'react'

import { useRepositoryContext } from '../../contexts/RepositoryContext'

import { ProvidersSidecar, RecipeSubset } from '../utils/recipeHelpers'

import { RepositoryActions } from './misc'

export const SidecarButton = forwardRef(({ ...props }: ButtonProps, ref) => (
  <Button
    small
    tertiary
    width="100%"
    justifyContent="stretch"
    {...props}
    ref={ref}
  />
))

function ResourcesSidecar() {
  const repository = useRepositoryContext()

  return (
    <Sidecar
      heading={<>{repository.name} resources</>}
      display="flex"
      flexDirection="column"
      gap="xxsmall"
    >
      {repository?.homepage && (
        <SidecarButton
          as="a"
          target="_blank"
          href={repository?.homepage}
          startIcon={<BrowserIcon />}
        >
          Website
        </SidecarButton>
      )}
      {repository.license?.url && (
        <SidecarButton
          as="a"
          target="_blank"
          href={repository.license.url}
          startIcon={<CertificateIcon />}
        >
          License
        </SidecarButton>
      )}
      {repository.gitUrl && (
        <SidecarButton
          as="a"
          target="_blank"
          href={repository.gitUrl}
          justifyContent="flex-start"
          startIcon={<GitHubLogoIcon />}
        >
          GitHub
        </SidecarButton>
      )}
    </Sidecar>
  )
}

export function RepositorySideCar(props: any) {
  const repository = useRepositoryContext()
  const recipes = repository?.recipes?.filter(
    (recipe) => !!recipe
  ) as RecipeSubset[]

  return (
    <Flex
      flexDirection="column"
      gap="large"
      position="relative"
      {...props}
    >
      <RepositoryActions />
      <ResourcesSidecar />
      <ProvidersSidecar
        type="bundle"
        name={repository.name}
        recipes={recipes}
      />
    </Flex>
  )
}
