import { A, Div, H1, Img, P, Span } from 'honorable'
import { GitHubIcon, LinksIcon, Tag } from 'pluralsh-design-system'

import { capitalize } from '../../utils/string'

function RepositoryHeader({ repository, ...props }) {
  console.log('repository', repository)

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
          mt={1}
          xflex="x4"
          color="text-xlight"
        >
          <P>
            Publised by {repository.publisher?.name?.toUpperCase()}
          </P>
          <P ml={1}>
            Available bundles
          </P>
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
