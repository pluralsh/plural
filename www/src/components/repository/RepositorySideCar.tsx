import { useContext } from 'react'
import {
  Button, Div, Flex, P,
} from 'honorable'
import {
  BrowserIcon, CertificateIcon, GitHubLogoIcon,
} from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'

import { RepositoryActions } from './misc'

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

export function RepositorySideCar(props: any) {
  const repository = useContext(RepositoryContext)

  return (
    <Div
      position="relative"
      width={200}
      paddingTop="medium"
      {...props}
    >
      <RepositoryActions />
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
      <RepositoryActions />
      <Flex
        align="center"
        marginLeft="medium"
      >
        <RepositorySideCarButtons />
      </Flex>
    </Flex>
  )
}
