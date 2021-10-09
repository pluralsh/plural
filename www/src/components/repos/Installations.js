import React, { useState } from 'react'
import { Box, Text } from 'grommet'
import { Trash} from 'grommet-icons'
import { useHistory } from 'react-router-dom'
import { HoveredBackground } from 'forge-core'
import { useQuery, useMutation } from 'react-apollo'
import { INSTALLATIONS_Q, DELETE_INSTALLATION } from './queries'
import { Repository, RepositoryInner } from './Repositories'
import { Container } from './Integrations'
import { chunk } from '../../utils/array'
import { Confirm } from '../utils/Confirm'
import { StandardScroller } from '../utils/SmoothScroller'
import { Placeholder } from '../accounts/Audits'
import { extendConnection } from '../../utils/graphql'
import { Icon } from '../accounts/Group'
import { ignore } from '../utils/ModalHeader'

function NoInstallations() {
  return (
    <Box>
      <Text size='small'>
        It looks like you have not installed anything.  Try searching for repositories,
      or browsing the available publishers.
      </Text>
    </Box>
  )
}

function DeleteInstallation({installation}) {
  const [confirm, setConfirm] = useState(false)
  const [mutation] = useMutation(DELETE_INSTALLATION, {
    variables: {id: installation.id},
    update: (cache, {data: {deleteInstallation}}) => {
      const {installations, ...prev} = cache.readQuery({query: INSTALLATIONS_Q})
      cache.writeQuery({query: INSTALLATIONS_Q, data: {
        ...prev, installations: {
          ...installations,
          edges: installations.edges.filter(({node}) => node.id !== deleteInstallation.id)
        }
      }})
    }
  })

  return (
    <>
    <Icon
      icon={Trash} 
      tooltip='delete' 
      onClick={(e) => { ignore(e); setConfirm(true) }} 
      iconAttrs={{color: 'error'}} />
    {confirm && <Confirm 
      label='Delete'
      description="this will delete the installation for the repo and all installed packages"
      submit={mutation}
      cancel={() => setConfirm(false)} />}
    </>
  )
}

function InstallationRow({installation, edit}) {
  let history = useHistory()
  return (
    <Box flex={false} pad='small' border={{side: 'bottom', color: 'tone-light'}}
         direction='row' align='center' hoverIndicator='light-1'
         onClick={() => history.push(`/repositories/${installation.repository.id}`)}>
      <RepositoryInner repo={installation.repository} />
      {edit && <DeleteInstallation installation={installation} />}
    </Box> 
  )
}

export default function Installations({edit}) {
  const [listRef, setListRef] = useState(null)
  const {data, loading, fetchMore} = useQuery(INSTALLATIONS_Q, {fetchPolicy: "cache-and-network"})

  if (!data) return null
  const {edges, pageInfo} = data.installations

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
        mapper={({node}) => <InstallationRow key={node.id} installation={node} edit={edit} />}
        loadNextPage={() => pageInfo.hasNextPage && fetchMore({
          variables: {chartCursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult: {installations}}) => {
            return extendConnection(prev, 'installations', installations)
          }
        })
      } />
    </Box>
  )
}