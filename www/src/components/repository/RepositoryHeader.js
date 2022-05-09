import { useContext } from 'react'
import { A, Div, H1, Img, P, Span } from 'honorable'
import { GitHubIcon, LinksIcon, Tag } from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { capitalize } from '../../utils/string'

import { RECIPES_QUERY } from './queries'

const providerToIcon = {
  GCP: `${process.env.PUBLIC_URL}/gcp.png`,
  AWS: `${process.env.PUBLIC_URL}/aws-icon.png`,
  AZURE: `${process.env.PUBLIC_URL}/azure.png`,
  EQUINIX: `${process.env.PUBLIC_URL}/equinix-metal.png`,
  KIND: `${process.env.PUBLIC_URL}/kind.png`,
}

const providerToIconSize = {
  GCP: 14,
  AWS: 12,
  AZURE: 14,
  EQUINIX: 14,
  KIND: 14,
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

  console.log('recipes', recipes)

  return (
    <Div
      py={2}
      px={2}
      xflex="x1"
      borderBottom="1px solid border"
      {...props}
    >
      <Div
        p={1}
        xflex="x5"
        backgroundColor="background-light"
        border="2px solid border"
        borderRadius={4}
      >
        <Img
          src={repository.darkIcon || repository.icon}
          alt={repository.name}
          width={106}
        />
      </Div>
      <Div
        ml={2}
      >
        <H1
          fontSize={32}
          lineHeight="32px"
        >
          {capitalize(repository.name)}
        </H1>
        <Div
          mt={0.75}
          xflex="x4"
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
                height={providerToIconSize[recipe.provider]}
                ml={0.5}
              />
            ))}
          </Div>
        </Div>
        <Div
          mt={0.5}
          xflex="x4"
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
        </Div>
        <Div
          mt={1}
          xflex="x11"
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
        </Div>
      </Div>
    </Div>
  )
}

export default RepositoryHeader
