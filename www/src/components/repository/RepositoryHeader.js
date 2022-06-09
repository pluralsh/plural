import { useContext, useState } from 'react'
import { useMutation } from '@apollo/client'
import { A, Button, Div, Flex, H1, H3, Icon, Img, Modal, P, Pre, Span } from 'honorable'
import { GitHubIcon, InstalledLabel, LinksIcon, Tag, TrashCanIcon } from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { capitalize } from '../../utils/string'

import { DELETE_INSTALLATION_MUTATION, RECIPES_QUERY } from './queries'
import { providerToIcon, providerToIconHeight } from './constants'

import InstallDropdownButton from './InstallDropdownButton'

function InstalledActions({ installation, ...props }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mutation] = useMutation(DELETE_INSTALLATION_MUTATION, {
    variables: {
      id: installation.id,
    },
    onCompleted: () => window.location.reload(),
  })

  return (
    <>
      <Flex
        align="center"
        {...props}
      >
        <InstalledLabel />
        <Icon
          ml={0.5}
          p={0.5}
          borderRadius="50%"
          cursor="pointer"
          hoverIndicator="fill-one"
          onClick={() => setModalOpen(true)}
        >
          <TrashCanIcon color="error" />
        </Icon>
      </Flex>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <H3>
          Are you sure you want to uninstall this bundle?
        </H3>
        <Div mt={2}>
          Be sure to run
          <Pre
            mx={0.25}
            mb={0.25}
          >
            plural destroy
          </Pre>
          in your installation repository before deleting.
          <br />
          This will delete all installed packages and prevent future upgrades.
        </Div>
        <Flex
          mt={2}
          align="center"
          justify="flex-end"
        >
          <Button
            secondary
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            primary
            ml={1}
            loading={loading}
            onClick={() => {
              setLoading(true)
              mutation()
            }}
          >
            Delete
          </Button>
        </Flex>
      </Modal>
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
        <InstallDropdownButton recipes={recipes} />
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
