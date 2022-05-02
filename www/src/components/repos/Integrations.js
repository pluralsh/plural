import { useContext, useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import styled from 'styled-components'
import { useNavigate, useParams } from 'react-router-dom'
import { Carousel, HoveredBackground, ScrollableContainer, Scroller } from 'forge-core'
import { Anchor, Box, Stack, Text, ThemeContext } from 'grommet'
import { FormNextLink, FormPrevious } from 'grommet-icons'
import { normalizeColor } from 'grommet/utils'

import { chunk } from '../../utils/array'
import { extendConnection } from '../../utils/graphql'
import { BreadcrumbsContext } from '../Breadcrumbs'

import { DetailContainer } from './Installation'
import { DetailHeader } from './Artifacts'
import Tags from './Tags'
import { INTEGRATIONS_Q } from './queries'

const ICON_SIZE = 50

function Integration({ name, description, icon, tags, sourceUrl, publisher, width }) {
  const navigate = useNavigate()
  const [hover, setHover] = useState(false)

  return (
    <Container
      pad="medium"
      width={width}
      hover={hover}
      setHover={setHover}
    >
      <Box
        direction="row"
        gap="medium"
      >
        {icon && (
          <Box
            align="center"
            justify="center"
            width={`${ICON_SIZE}px`}
          >
            <img
              src={icon}
              alt={name}
              width={`${ICON_SIZE}px`}
              height={`${ICON_SIZE}px`}
            />
          </Box>
        )}
        <Box gap="xsmall">
          <Box>
            <Text
              weight={500}
              size="small"
            >{name}
            </Text>
            {publisher && (
              <Box
                direction="row"
                gap="xxsmall"
              >
                <Text size="small">by: </Text>
                <Anchor
                  size="small"
                  onClick={() => navigate(`/publishers/${publisher.id}`)}
                >
                  {publisher.name}
                </Anchor>
              </Box>
            )}
          </Box>
          <Text
            color="dark-3"
            size="small"
          >{description}
          </Text>
          {tags && tags.length > 0 && (
            <Box
              direction="row"
              gap="xxsmall"
            >
              {tags.map(({ tag }) => (
                <Text
                  key={tag}
                  size="xsmall"
                  color="dark-3"
                >#{tag}
                </Text>
              ))}
            </Box>
          )}
        </Box>
      </Box>
      {hover && sourceUrl && <SourceLink sourceUrl={sourceUrl} />}
    </Container>
  )
}

const containerStyling = styled.div`
  border-color: ${props => props.borderColor};
  border-width: 1px;
  border-style: solid;
  border-radius: ${props => props.theme.global.edgeSize[props.round || 'medium']} !important;
  ${props => props.width && `width: ${props.width} !important;`}

  ${props => !props.noHover && `&:hover {
      border-color: ${props.brandColor};
      box-shadow: ${props.elevation};
    }`
}
  &:hover .modifier {
    display: flex !important;
  }
`

export function Container({ pad, width, hover, setHover, children, modifier, noHover, ...rest }) {
  const theme = useContext(ThemeContext)

  return (
    <Stack
      as={containerStyling}
      width={width}
      noHover={noHover}
      brandColor={normalizeColor('brand', theme)}
      borderColor={normalizeColor('border', theme)}
      round="xsmall"
      anchor="top-right"
      onMouseEnter={() => setHover && setHover(true)}
      onMouseLeave={() => setHover && setHover(false)}
    >
      <Box
        height="100%"
        width="100%"
        pad={pad || 'medium'}
        round="xsmall"
        focusIndicator={false}
        {...rest}
      >
        {children}
      </Box>
      <Box
        className="modifier"
        margin={{ top: 'xsmall', right: 'xsmall' }}
      >
        {modifier}
      </Box>
    </Stack>
  )
}

function SourceLink({ sourceUrl }) {
  return (
    <Box
      direction="row"
      justify="end"
      fill="horizontal"
      pad={{ horizontal: 'small' }}
      animation={{ type: 'slideUp', duration: 200, size: 'large' }}
    >
      <Anchor
        href={sourceUrl}
        color="focus"
        _target="blank"
      >
        <Box
          direction="row"
          gap="xsmall"
          align="center"
        >
          <Text
            size="small"
            color="focus"
          >Source code
          </Text>
          <FormNextLink size="12px" />
        </Box>
      </Anchor>
    </Box>
  )
}

function IntegrationGrid({ integrations: { edges, pageInfo }, fetchMore }) {
  return (
    <Scroller
      style={{ overflow: 'auto', height: '100%', width: '100%' }}
      edges={Array.from(chunk(edges, 3))}
      mapper={chunk => (
        <Box
          key={chunk[0].id}
          direction="row"
          gap="small"
          fill="horizontal"
          margin={{ bottom: 'small' }}
        >
          {chunk.map(({ node }) => (
            <Integration
              key={node.id}
              {...node}
              width="30%"
            />
          ))}
        </Box>
      )}
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({
        variables: { intCursor: pageInfo.endCursor },
        updateQuery: (prev, { fetchMoreResult: { integrations } }) => extendConnection(prev, integrations, 'integrations'),
      })}
    />
  )
}

export function TagHeader({ tag, setTag }) {
  return (
    <HoveredBackground>
      <Box
        accentable
        focusIndicator={false}
        align="center"
        direction="row"
        onClick={() => setTag(null)}
      >
        <FormPrevious size="20px" />
        <Text weight={500}># {tag}</Text>
      </Box>
    </HoveredBackground>
  )
}

const WIDTH = 15

export function IntegrationPage() {
  const [tag, setTag] = useState(null)
  const { repositoryId } = useParams()
  const { data, fetchMore } = useQuery(INTEGRATIONS_Q, {
    variables: { id: repositoryId, tag },
    fetchPolicy: 'cache-and-network',
  })
  const { setBreadcrumbs } = useContext(BreadcrumbsContext)
  useEffect(() => {
    if (!data) return
    const { repository } = data

    setBreadcrumbs([
      { url: `/publishers/${repository.publisher.id}`, text: repository.publisher.name },
      { url: `/repositories/${repository.id}`, text: repository.name },
      { url: `/repositories/${repository.id}/integrations`, text: 'integrations' },
    ])
  }, [setBreadcrumbs, data])

  if (!data) return null

  const { tags, integrations, repository } = data

  return (
    <ScrollableContainer>
      <Box
        direction="row"
        height="100%"
      >
        <Box
          width={`${WIDTH}%`}
          height="100%"
          border={{ side: 'right', color: 'border' }}
        >
          <Tags
            tags={tags}
            fetchMore={fetchMore}
            setTag={setTag}
            tag={tag}
          />
        </Box>
        <Box
          pad="medium"
          width={`${100 - WIDTH}%`}
          gap="small"
        >
          <Box>
            {tag ? (
              <TagHeader
                tag={tag}
                setTag={setTag}
              />
            ) :
              <Text weight={500}>{repository.name}</Text>}
          </Box>
          <IntegrationGrid
            integrations={integrations}
            fetchMore={fetchMore}
          />
        </Box>
      </Box>
    </ScrollableContainer>
  )
}

function ViewAll({ repositoryId }) {
  const navigate = useNavigate()

  return (
    <Box flex={false}>
      <Anchor
        color="focus"
        onClick={() => navigate(`/repositories/${repositoryId}/integrations`)}
      >
        <Box
          direction="row"
          gap="xxsmall"
          align="center"
        >
          <Text
            size="small"
            color="focus"
          >
            view all
          </Text>
          <FormNextLink
            size="15px"
            color="focus"
          />
        </Box>
      </Anchor>
    </Box>
  )
}

export default function Integrations({ integrations: { edges, pageInfo }, fetchMore, repository }) {
  return (
    <DetailContainer>
      <Box>
        <DetailHeader
          text="Integrations"
          modifier={<ViewAll repositoryId={repository.id} />}
        />
        <Box pad="small">
          <Carousel
            slidesPerPage={1}
            offset={12}
            edges={edges}
            mapper={({ node }) => (
              <Integration
                key={node.id}
                {...node}
                width="75%"
              />
            )}
            fetchMore={() => {
              if (!pageInfo.hasNextPage) return

              fetchMore({
                variables: { intCursor: pageInfo.endCursor },
                updateQuery: (prev, { fetchMoreResult }) => {
                  const { edges, pageInfo } = fetchMoreResult.integrations

                  return edges.length ? {
                    ...prev,
                    integrations: {
                      ...prev.integrations,
                      pageInfo,
                      edges: [...prev.integrations.edges, ...edges],
                    },
                  } : prev
                },
              })
            }}
          />
        </Box>
      </Box>
    </DetailContainer>
  )
}
