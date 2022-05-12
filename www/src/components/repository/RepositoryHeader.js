import { useContext, useState } from 'react'
import { A, Div, DropdownButton, ExtendTheme, Flex, H1, H2, Img, MenuItem, Modal, P, Span } from 'honorable'
import { GitHubIcon, LinksIcon, Tag } from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { capitalize } from '../../utils/string'

import Code from '../utils/Code'

import { RECIPES_QUERY } from './queries'

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
    Menu: [
      {
        width: 256 + 64 - 16,
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
        <P
          mt={2}
          mb={1}
        >
          In your installation repository run:
        </P>
        <Code language="bash">
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
              <Flex align="center">
                <Flex
                  align="center"
                  justify="center"
                  width={3 * 16}
                  height={3 * 16}
                  background="background-top"
                  flexShrink={0}
                >
                  <Img
                    alt={recipe.name}
                    src={providerToIcon[recipe.provider]}
                    height={1.5 * providerToIconHeight[recipe.provider]}
                  />
                </Flex>
                <P
                  ml={1}
                  flexShrink={0}
                >
                  Install on {providerToDisplayName[recipe.provider]}
                </P>
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
        backgroundColor="background-light"
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
            Publised by {repository.publisher?.name?.toUpperCase()}
          </P>
          <P ml={1}>
            Available bundles
          </P>
          <Div
            mt={0.25}
          >
            {recipes.map(recipe => (
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
          <A>
            <LinksIcon
              color="text"
              size={12}
            />
            <Span ml={0.25}>
              airbyte.com
            </Span>
          </A>
          <A ml={1}>
            <GitHubIcon
              color="text"
              size={12}
            />
            <Span ml={0.25}>
              github.com/airbytehq/airbyte
            </Span>
          </A>
        </Flex>
        <Flex
          mt={1}
          align="flex-start"
          wrap="wrap"
        >
          {repository.tags.map(({ tag }) => (
            <Tag
              key={tag}
              mr={0.5}
              mb={0.5}
            >
              {tag}
            </Tag>
          ))}
        </Flex>
      </Div>
      <Div flexGrow={1} />
      <InstallDropdownButton recipes={recipes} />
    </Flex>
  )
}

export default RepositoryHeader
