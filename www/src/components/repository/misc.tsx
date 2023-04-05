import { Flex } from 'honorable'
import { Button, GearTrainIcon } from '@pluralsh/design-system'
import { useState } from 'react'

import { useRepositoryContext } from '../../contexts/RepositoryContext'
import InstallDropdownButton from '../utils/InstallDropdownButton'
import { RecipeSubset } from '../utils/recipeHelpers'

import { InferredConsoleButton } from './ConsoleButton'
import { InstallationConfiguration } from './InstallationConfiguration'

function InstalledRepositoryActions({ installation, ...props }: any) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Flex
        align="center"
        gap="medium"
        {...props}
      >
        <InferredConsoleButton
          secondary
          text="Console"
          flexGrow={1}
        />
        <Button
          secondary
          onClick={() => setOpen(true)}
        >
          <GearTrainIcon
            position="relative"
            height="24px"
          />
        </Button>
      </Flex>
      <InstallationConfiguration
        open={open}
        setOpen={setOpen}
        installation={installation}
      />
    </>
  )
}

export function RepositoryActions() {
  const repository = useRepositoryContext()

  const recipes = repository?.recipes?.filter(recipe => !!recipe) as
    | RecipeSubset[]
    | undefined

  if (repository.installation) {
    return <InstalledRepositoryActions installation={repository.installation} />
  }

  return (
    <InstallDropdownButton
      loading={false}
      type="bundle"
      name={repository.name}
      recipes={recipes}
      width="100%"
    />
  )
}
