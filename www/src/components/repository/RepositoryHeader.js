import { useContext, useState } from 'react'
import { useMutation } from '@apollo/client'
import { A, Button, Div, Flex, H1, H3, Icon, Img, Modal, P, Pre, Span } from 'honorable'
import { GearTrainIcon, GitHubIcon, LinksIcon, Tag, TrashCanIcon } from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { capitalize } from '../../utils/string'

import { InferredConsoleButton } from '../clusters/ConsoleButton'

import { DELETE_INSTALLATION_MUTATION, RECIPES_QUERY } from './queries'
import { providerToIcon, providerToIconHeight } from './constants'

import InstallDropdownButton from './InstallDropdownButton'
import { InstallationConfiguration } from './InstallationConfiguration'

function InstalledActions({ installation, ...props }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Flex
        align="center"
        gap="small"
        {...props}
      >
        <Button
          secondary
          endIcon={<GearTrainIcon size={16} />}
          onClick={() => setOpen(true)}
        >
          Configuration
        </Button>
        <InferredConsoleButton />
      </Flex>
      <InstallationConfiguration
        open={open}
        setOpen={setOpen}
        installation={installation}
      />
    </>
  )
}

function RepositoryHeader(props) {
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
    <Flex
      py={2}
      px={2}
      align="flex-start"
      borderBottom="1px solid border"
      {...props}
    >
      <Flex
        p={1}
        align="center"
        justify="center"
        backgroundColor="fill-one"
        border="1px solid border"
        borderRadius={4}
      >
        <Img
          src={repository.darkIcon || repository.icon}
          alt={repository.name}
          width={106}
        />
      </Flex>
      <Div
        ml={2}
      >
        <H1
          fontSize={32}
          lineHeight="32px"
        >
          {capitalize(repository.name)}
        </H1>
        <Flex
          mt={0.5}
          align="center"
          color="text-xlight"
        >
          <P>
            Published by {capitalize(repository.publisher?.name)}
          </P>
          <P ml={1}>
            Available bundles
          </P>
          <Div
            mt={0.25}
          >
            {recipes
            .filter((recipe, i, a) => a.findIndex(r => r.provider === recipe.provider) === i)
            .map(recipe => (
              <Img
                key={recipe.id}
                alt={recipe.name}
                src={providerToIcon[recipe.provider]}
                height={providerToIconHeight[recipe.provider]}
                ml={0.5}
              />
            ))}
          </Div>
        </Flex>
        <Flex
          mt={0.5}
          align="center"
        >
          {repository.homepage && (
            <A
              target="_blank"
              href={repository.homepage}
            >
              <LinksIcon
                color="text"
                size={12}
              />
              <Span ml={0.25}>
                {repository.homepage && repository.homepage.replaceAll(/(^https?:\/\/)|(\/+$)/g, '')}
              </Span>
            </A>
          )}
          {repository.git_url && (
            <A
              ml={1}
              target="_blank"
              href={repository.git_url}
            >
              <GitHubIcon
                color="text"
                size={12}
              />
              <Span ml={0.25}>
                {repository.git_url && repository.git_url.replaceAll(/(^https?:\/\/)|(\/+$)/g, '')}
              </Span>
            </A>
          )}
        </Flex>
        <Flex
          mt={1}
          align="flex-start"
          wrap="wrap"
        >
          {repository.tags.map(({ name }) => (
            <Tag
              key={name}
              mr={0.5}
              mb={0.5}
            >
              {name}
            </Tag>
          ))}
        </Flex>
      </Div>
      <Div flexGrow={1} />
      <Flex align="center">
        {!repository.installation && <InstallDropdownButton recipes={recipes} />}
        {!!repository.installation && (
          <InstalledActions
            installation={repository.installation}
            ml={1}
          />
        )}
      </Flex>
    </Flex>
  )
}

export default RepositoryHeader
