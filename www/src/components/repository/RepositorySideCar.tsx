import { useContext, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { A, Div, Flex, Img, P, Button, Icon } from 'honorable'
import { GearTrainIcon, GitHubIcon, InvoicesIcon, LinksIcon, Tag } from 'pluralsh-design-system'


import RepositoryContext from '../../contexts/RepositoryContext'
import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { capitalize } from '../../utils/string'

import { InferredConsoleButton } from '../clusters/ConsoleButton'

import { RECIPES_QUERY } from './queries'
import { providerToIcon, providerToIconHeight } from './constants'

import InstallDropdownButton from './InstallDropdownButton'
import { InstallationConfiguration } from './InstallationConfiguration'

function InstalledActions({ installation, ...props }: any) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Flex
        align="center"
        gap="medium"
        {...props}
      >
        <InferredConsoleButton
          primary
          secondary={false}
          text="Console"
          flexGrow={1}
        />
        <Button
          secondary
          onClick={() => setOpen(true)}
        >
          <GearTrainIcon position="relative" top={4} />
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

function RepositorySideCar({ ...props }) {
  const [open, setOpen] = useState(false)
  const repository = useContext(RepositoryContext)
  const [recipes] = usePaginatedQuery(
    RECIPES_QUERY,
    {
      variables: {
        repositoryId: repository.id,
      },
    },
    data => data.recipes
  )

  return (
    <Div
      position="relative"
      width={200}
      paddingTop="medium"
      {...props}
    >
      {!repository.installation && <InstallDropdownButton recipes={recipes} />}
      {!!repository.installation && <InstalledActions installation={repository.installation} />}
      <Div
        marginTop={2}
        border="1px solid border"
        borderRadius="large"
        padding="medium"
      >
        <Button
          small
          tertiary
        >
          Website
        </Button>
      </Div>
    </Div>
  )
}

export default RepositorySideCar
