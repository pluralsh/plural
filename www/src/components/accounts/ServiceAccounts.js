import { useCallback, useContext, useState } from 'react'
import { Box, Layer, TextInput } from 'grommet'
import { useMutation, useQuery } from '@apollo/client'
import { Edit } from 'grommet-icons'
import { Scroller } from 'forge-core'
import { Button } from 'honorable'

import { ModalHeader } from '../ModalHeader'
import { extendConnection, removeConnection, updateCache } from '../../utils/graphql'
import { GqlError } from '../utils/Alert'
import { fetchToken, setPreviousUserData, setToken } from '../../helpers/authentication'

import { SectionContentContainer, SectionPortal } from '../Explore'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { DeleteUser } from '../users/DeleteUser'
import { CurrentUserContext } from '../login/CurrentUser'

import { Icon } from './Group'
import { INPUT_WIDTH } from './constants'
import { UserRow } from './User'
import { CreateServiceAccount, UpdateServiceAccount } from './CreateServiceAccount'
import { IMPERSONATE_SERVICE_ACCOUNT, USERS_Q } from './queries'
import { SearchIcon } from './utils'

function ServiceAccount({ user, next, update }) {
  const [open, setOpen] = useState(false)
  const [showError, setShowError] = useState(true)
  const [mutation, { loading, error }] = useMutation(IMPERSONATE_SERVICE_ACCOUNT, {
    variables: { id: user.id },
    update: (cache, { data: { impersonateServiceAccount: { jwt } } }) => {
      setToken(jwt)
      window.location = '/'
    },
  })
  const me = useContext(CurrentUserContext)

  function handleImpersonateClick() {
    setPreviousUserData({
      me,
      jwt: fetchToken(),
    })
    mutation()
  }

  return (
    <>
      <Box
        fill="horizontal"
        gap="small"
        direction="row"
        align="center"
        border={{ side: 'bottom', color: 'border' }}
        pad={{ right: 'small' }}
      >
        <UserRow
          user={user}
          next={next.node}
          noborder
          notoggle
        />
        <Button
          secondary
          onClick={handleImpersonateClick}
          loading={loading}
        >
          Impersonate
        </Button>
        <Icon
          icon={Edit}
          tooltip="edit"
          onClick={() => setOpen(true)}
        />
        <DeleteUser
          id={user.id}
          update={update}
        />
      </Box>
      {showError && error && (
        <Layer modal>
          <ModalHeader
            text="Impersonation error"
            setOpen={setShowError}
          />
          <Box
            width="40vw"
            pad="small"
          >
            <GqlError
              error={error}
              header={`error attempting to impersonate ${user.email}`}
            />
          </Box>
        </Layer>
      )}
      {open && (
        <Layer modal>
          <ModalHeader
            text={`Update ${user.name}`}
            setOpen={setOpen}
          />
          <Box width="40vw">
            <UpdateServiceAccount
              user={user}
              setOpen={setOpen}
            />
          </Box>
        </Layer>
      )}
    </>
  )
}

export function ServiceAccounts() {
  const [q, setQ] = useState(null)
  const { data, fetchMore } = useQuery(USERS_Q, {
    variables: { q, serviceAccount: true },
    fetchPolicy: 'cache-and-network',
  })
  const update = useCallback((cache, { data: { deleteUser } }) => updateCache(cache, {
    query: USERS_Q,
    variables: { q, serviceAccount: true },
    update: prev => removeConnection(prev, deleteUser, 'users'),
  }), [q])

  if (!data) return <LoopingLogo />

  const { users: { pageInfo, edges } } = data

  return (
    <SectionContentContainer header="Service Accounts">
      <Scroller
        id="service-accounts"
        style={{ height: '100%', overflow: 'auto' }}
        edges={edges}
        mapper={({ node }, next) => (
          <ServiceAccount
            key={node.id}
            user={node}
            next={next}
            update={update}
          />
        )}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: { userCursor: pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult: { users } }) => extendConnection(prev, users, 'users'),
        })}
      />
      <SectionPortal>
        <Box
          flex={false}
          align="center"
          gap="small"
          direction="row"
          width={INPUT_WIDTH}
        >
          <TextInput
            icon={<SearchIcon />}
            reverse
            placeholder="search for service accounts"
            value={q || ''}
            onChange={({ target: { value } }) => setQ(value)}
          />
          <Box flex={false}>
            <CreateServiceAccount />
          </Box>
        </Box>
      </SectionPortal>
    </SectionContentContainer>
  )
}
