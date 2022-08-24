import { useContext, useState } from 'react'
import {
  Button, Div, Flex, P,
} from 'honorable'
import {
  BrowserIcon, CertificateIcon, GearTrainIcon, GitHubLogoIcon,
} from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'
import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { InferredConsoleButton } from '../clusters/ConsoleButton'

import { RECIPES_QUERY } from './queries'

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

function RepositorySideCarButtons() {
  const repository = useContext(RepositoryContext)

  return (
    <>
      <Button
        small
        tertiary
        as="a"
        target="_blank"
        href={repository.homepage}
        startIcon={(
          <BrowserIcon />
        )}
      >
        Website
      </Button>
      {repository.license?.url && (
        <Button
          small
          tertiary
          as="a"
          target="_blank"
          href={repository.license.url}
          startIcon={(
            <CertificateIcon />
          )}
        >
          License
        </Button>
      )}
      <Button
        small
        tertiary
        as="a"
        target="_blank"
        href={repository.gitUrl}
        startIcon={(
          <GitHubLogoIcon />
        )}
      >
        GitHub
      </Button>
    </>
  )
}

function RepositorySideCarActions() {
  const repository = useContext(RepositoryContext)
  const [recipes] = usePaginatedQuery(RECIPES_QUERY,
    {
      variables: {
        repositoryId: repository.id,
      },
    },
    data => data.recipes)

  return (
    <>
      {!repository.installation && <InstallDropdownButton recipes={recipes} />}
      {!!repository.installation && <InstalledActions installation={repository.installation} />}
    </>
  )
}

export function RepositorySideCar(props: any) {
  const repository = useContext(RepositoryContext)

  return (
    <Div
      position="relative"
      width={200}
      paddingTop="medium"
      {...props}
    >
      <RepositorySideCarActions />
      <Div
        marginTop="large"
        border="1px solid border"
        borderRadius="large"
        padding="medium"
      >
        <P
          overline
          color="text-xlight"
          wordBreak="break-word"
        >
          {repository.name} resources
        </P>
        <Flex
          marginTop="medium"
          width="100%"
          direction="column"
          align="flex-start"
        >
          <RepositorySideCarButtons />
        </Flex>
      </Div>
    </Div>
  )
}

export function RepositorySideCarCollapsed(props: any) {
  return (
    <Flex
      align="center"
      {...props}
    >
      <RepositorySideCarActions />
      <Flex
        align="center"
        marginLeft="medium"
      >
        <RepositorySideCarButtons />
      </Flex>
    </Flex>
  )
}
