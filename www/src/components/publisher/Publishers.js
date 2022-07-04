import { useContext, useEffect, useRef, useState } from 'react'
import { Anchor, Box, Drop, Text } from 'grommet'
import { useQuery } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { Scroller } from 'forge-core'

import Avatar from '../users/Avatar'
import { Container } from '../repos/Integrations'
import { BreadcrumbsContext } from '../Breadcrumbs'

import { PUBLISHERS_Q } from './queries'

const STUB_ICON_SIZE = '20px'

function RepoStub({ id, icon, name }) {
  const dropRef = useRef()
  const [hover, setHover] = useState(false)
  const navigate = useNavigate()

  return (
    <Box
      ref={dropRef}
      focusIndicator={false}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => navigate(`/publishers/${id}`)}
      align="center"
      justify="center"
    >
      <img
        height={STUB_ICON_SIZE}
        width={STUB_ICON_SIZE}
        src={icon}
        alt={name}
      />
      {hover && (
        <Drop
          target={dropRef.current}
          align={{ bottom: 'top' }}
          plain
        >
          <Box
            background="#222222"
            pad={{ vertical: 'xsmall', horizontal: 'small' }}
            round="xsmall"
          >
            {name}
          </Box>
        </Drop>
      )}
    </Box>
  )
}

function Publisher({ publisher: { id, name, description, repositories, ...publisher } }) {
  const navigate = useNavigate()

  return (
    <Container
      direction="row"
      gap="small"
      onClick={() => navigate(`/publishers/${id}`)}
    >
      <Avatar
        size="65px"
        user={{ ...publisher, name }}
      />
      <Box>
        <Anchor
          onClick={() => navigate(`/publishers/${id}`)}
          size="small"
          weight="bold"
        >
          {name}
        </Anchor>
        <Text size="small"><i>{description}</i></Text>
        <Box
          direction="row"
          gap="xsmall"
          margin={{ top: 'xsmall' }}
        >
          {repositories.map(({ id, icon, name }) => (
            <RepoStub
              key={id}
              id={id}
              icon={icon}
              name={name}
            />
          ))}
        </Box>
      </Box>
    </Container>
  )
}

export default function Publishers() {
  const { loading, data, fetchMore } = useQuery(PUBLISHERS_Q)
  const { setBreadcrumbs } = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([])
  }, [setBreadcrumbs])

  if (loading || !data) return null

  const { edges, pageInfo } = data.publishers

  return (
    <Box
      gap="small"
      pad="medium"
    >
      <Scroller
        id="publishers"
        edges={edges}
        style={{ overflow: 'auto', height: '100%', width: '100%' }}
        mapper={({ node }) => <Publisher publisher={node} />}
        onLoadMore={() => pageInfo && fetchMore({
          variables: { cursor: pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult: { publishers: { edges, pageInfo } } }) => ({ ...prev,
            publishers: {
              ...prev.publishers,
              pageInfo,
              edges: [...prev.publishers.edges, ...edges],
            },
          }),
        })}
      />
    </Box>
  )
}
