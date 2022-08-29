import { InferredConsoleButton } from 'components/clusters/ConsoleButton'
import RepositoryContext from 'contexts/RepositoryContext'
import { Flex } from 'honorable'
import usePaginatedQuery from 'hooks/usePaginatedQuery'
import { Button, GearTrainIcon } from 'pluralsh-design-system'
import { useContext, useState } from 'react'

import { InstallationConfiguration } from './InstallationConfiguration'

import InstallDropdownButton from './InstallDropdownButton'

import { RECIPES_QUERY } from './queries'

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
            top={4}
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
  const repository = useContext(RepositoryContext)
  const [recipes] = usePaginatedQuery(RECIPES_QUERY,
    { variables: { repositoryId: repository.id } },
    data => data.recipes)

  if (repository.installation) return <InstalledRepositoryActions installation={repository.installation} />

  return (<InstallDropdownButton recipes={recipes} />)
}
