import React, { useState } from 'react'
import { Box, Text } from 'grommet'
import { useNavigate } from 'react-router-dom'
import { Trash } from 'forge-core'
import { useMutation, useQuery } from '@apollo/client'

import { Confirm } from '../utils/Confirm'
import { StandardScroller } from '../utils/SmoothScroller'
import { Placeholder } from '../accounts/Audits'
import { extendConnection, removeConnection, updateCache } from '../../utils/graphql'
import { Icon } from '../accounts/Group'
import { ignored } from '../../utils/event'

import { RepositoryInner } from './Repositories'
import { DELETE_INSTALLATION, INSTALLATIONS_Q } from './queries'

function NoInstallations() {
  return (
    <Box>
      <Text size="small">
        It looks like you have not installed anything.  Try searching for repositories,
        or browsing the available publishers.
      </Text>
    </Box>
  )
}

function DeleteInstallation({ installation }) {
  const [confirm, setConfirm] = useState(false)
  const [mutation] = useMutation(DELETE_INSTALLATION, {
    variables: { id: installation.id },
    update: (cache, { data: { deleteInstallation } }) => {
      updateCache(cache, {
        query: INSTALLATIONS_Q,
        update: prev => removeConnection(prev, deleteInstallation, 'installations'),
      })
    },
  })

  return (
    <>
      <Icon
        icon={Trash}
        tooltip="delete"
        onClick={ignored(() => setConfirm(true))}
        iconAttrs={{ color: 'error' }}
      />
      {confirm && (
        <Confirm
          label="Delete"
          description="Be sure to run `plural destroy` in your installation repo before deleting.  This will delete all installed packages and prevent future upgrades."
          submit={ignored(() => mutation())}
          cancel={() => setConfirm(false)}
        />
      )}
    </>
  )
}

function InstallationRow({ installation, edit }) {
  const navigate = useNavigate()

  return (
    <Box
      flex={false}
      pad="small"
      border={{ side: 'bottom', color: 'tone-light' }}
      direction="row"
      align="center"
      hoverIndicator="light-1"
      onClick={() => navigate(`/repositories/${installation.repository.id}`)}
    >
      <RepositoryInner repo={installation.repository} />
      {edit && <DeleteInstallation installation={installation} />}
    </Box>
  )
}

export default function Installations({ edit }) {
  const [listRef, setListRef] = useState(null)
  const { data, loading, fetchMore } = useQuery(INSTALLATIONS_Q, { fetchPolicy: 'cache-and-network' })

  if (!data) return null
  const { edges, pageInfo } = data.installations

  if (edges.length === 0) return <NoInstallations />

  return (
    <Box fill>
      <StandardScroller
        listRef={listRef}
        setListRef={setListRef}
        items={edges}
        hasNextPage={pageInfo.hasNextPage}
        placeholder={Placeholder}
        loading={loading}
        mapper={({ node }) => (
          <InstallationRow
            key={node.id}
            installation={node}
            edit={edit}
          />
        )}
        loadNextPage={() => pageInfo.hasNextPage && fetchMore({
          variables: { chartCursor: pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult: { installations } }) => extendConnection(prev, 'installations', installations),
        })}
      />
    </Box>
  )
}
