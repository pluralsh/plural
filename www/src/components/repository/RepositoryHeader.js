import { useContext, useState } from 'react'
import { useMutation } from '@apollo/client'
import { A, Button, Div, DropdownButton, ExtendTheme, Flex, H1, H2, H3, Icon, Img, MenuItem, Modal, P, Pre, Span } from 'honorable'
import { GitHubIcon, InstalledLabel, LinksIcon, Tag, TrashCanIcon } from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { capitalize } from '../../utils/string'

import Code from '../utils/Code'

import { DELETE_INSTALLATION_MUTATION, RECIPES_QUERY } from './queries'

const providerToIcon = {
  AWS: `${process.env.PUBLIC_URL}/aws-icon.png`,
  AZURE: `${process.env.PUBLIC_URL}/azure.png`,
  EQUINIX: `${process.env.PUBLIC_URL}/equinix-metal.png`,
  GCP: `${process.env.PUBLIC_URL}/gcp.png`,
  KIND: `${process.env.PUBLIC_URL}/kind.png`,
}

const providerToIconHeight = {
  AWS: 12,
  AZURE: 14,
  EQUINIX: 16,
  GCP: 14,
  KIND: 14,
}

const providerToDisplayName = {
  AWS: 'Amazon Web Services',
  AZURE: 'Azure',
  EQUINIX: 'Equinix Metal',
  GCP: 'Google Cloud Platform',
  KIND: 'Kind',
}

const extendedTheme = {
  DropdownButton: {
    Button: [
      {
        borderRadius: 'normal',
      },
    ],
    Menu: [
      {
        width: 256 + 64 + 16 + 4,
        left: 'unset',
      },
    ],
  },
  MenuItem: {
    Root: [
      {
        borderBottom: '1px solid border',
        '&:last-of-type': {
          borderBottom: 'none',
        },
      },
    ],
  },
}

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

function InstallDropdownButton({ recipes, ...props }) {
  const { name } = useContext(RepositoryContext)
  const [recipe, setRecipe] = useState(null)

  function renderModalContent() {
    if (!recipe) return null

    return (
      <Div minWidth={512}>
        <Flex
          align="center"
          as={H2}
        >
          Install {capitalize(name)} on {providerToDisplayName[recipe.provider]}
          <Img
            ml={0.75}
            alt={recipe.name}
            src={providerToIcon[recipe.provider]}
            height={1.5 * providerToIconHeight[recipe.provider]}
          />
        </Flex>
        <P mt={2}>
          {capitalize(recipe.description)}.
        </P>
        <P mt={1}>
          In your installation repository run:
        </P>
        <Code
          language="bash"
          mt={2}
        >
          {`plural bundle install ${name} ${recipe.name}`}
        </Code>
      </Div>
    )
  }

  return (
    <>
      <ExtendTheme theme={extendedTheme}>
        <DropdownButton
          fade
          label="Install"
          onChange={event => setRecipe(event.target.value)}
          {...props}
        >
          {recipes.map(recipe => (
            <MenuItem
              key={recipe.id}
              value={recipe}
            >
              <Flex>
                <Flex
                  align="center"
                  justify="center"
                  width={2 * 16}
                  flexShrink={0}
                >
                  <Img
                    alt={recipe.name}
                    src={providerToIcon[recipe.provider]}
                    height={1.5 * providerToIconHeight[recipe.provider]}
                  />
                </Flex>
                <Div
                  ml={1}
                  flexShrink={0}
                  flexGrow={1}
                  flexBasis="calc(100% - 4 * 16px)"
                >
                  <P fontWeight={500}>
                    {providerToDisplayName[recipe.provider]}
                  </P>
                  <P
                    wordBreak="break-word"
                  >
                    {capitalize(recipe.description)}
                  </P>
                </Div>
              </Flex>
            </MenuItem>
          ))}
        </DropdownButton>
      </ExtendTheme>
      <Modal
        open={!!recipe}
        onClose={() => setRecipe(null)}
      >
        {renderModalContent()}
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
        border="2px solid border"
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
            Published by {repository.publisher?.name?.toUpperCase()}
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
