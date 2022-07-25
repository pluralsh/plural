import { useContext, useState } from 'react'
import { Button, Div, Flex, P } from 'honorable'
import { BrowserIcon, CertificateIcon, GearTrainIcon } from 'pluralsh-design-system'

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
          primary
          secondary={false}
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

function RepositorySideCar({ collapsed = false, ...props }: any) {
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
        marginTop="large"
        border="1px solid border"
        borderRadius="large"
        padding="medium"
      >
        <P
          overline
          color="text-xlight"
        >
          {repository.name} resources
        </P>
        <Flex
          marginTop="medium"
          width="100%"
          direction="column"
          align="flex-start"
        >
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
            href={repository.git_url}
          >
            GitHub
          </Button>
        </Flex>
      </Div>
    </Div>
  )
}

export default RepositorySideCar
