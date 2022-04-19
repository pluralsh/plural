import { Box, Text } from 'grommet'
import { Trash } from 'forge-core'
import moment from 'moment'
import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'

import { updateCache } from '../../utils/graphql'
import { TableRow } from '../accounts/Domains'
import { Icon } from '../accounts/Group'
import { HeaderItem } from '../repos/Docker'
import { Provider } from '../repos/misc'
import { Confirm } from '../utils/Confirm'

import { DELETE_EAB_CREDENTIALS, EAB_CREDENTIALS } from './queries'
import { obscure } from './utils'

function EabCredentialHeader() {
  return (
    <TableRow>
      <HeaderItem
        text="Key Id"
        width="20%"
      />
      <HeaderItem
        text="Hmac Key"
        width="30%"
      />
      <HeaderItem
        text="Cluster"
        width="20%"
      />
      <HeaderItem
        text="Created On"
        width="30%"
      />
    </TableRow>
  )
}

function DeleteCredential({ eab }) {
  const [confirm, setConfirm] = useState(false)
  const [mutation, { loading, error }] = useMutation(DELETE_EAB_CREDENTIALS, {
    variables: { id: eab.id },
    update: (cache, { data: { deleteEabKey } }) => updateCache(cache, {
      query: EAB_CREDENTIALS,
      update: prev => ({ ...prev, eabCredentials: prev.eabCredentials.filter(({ id }) => id !== deleteEabKey.id) }),
    }),
  })

  return (
    <>
      <Icon
        icon={Trash}
        onClick={() => setConfirm(true)}
        iconAttrs={{ color: 'error' }}
      />
      {confirm && (
        <Confirm
          error={error}
          header="Delete credential?"
          description="This will delete the credential permanently (a new one can be recreated)"
          submit={mutation}
          cancel={() => setConfirm(false)}
          label="Delete"
          loading={loading}
        />
      )}
    </>
  )
}

function EabCredential({ eab }) {
  return (
    <TableRow>
      <HeaderItem
        text={eab.keyId}
        nobold
        truncate
        width="20%"
      />
      <HeaderItem
        text={obscure(eab.hmacKey)}
        nobold
        width="30%"
      />
      <Box
        width="20%"
        direction="row"
        gap="xsmall"
        align="center"
      >
        <Provider
          provider={eab.provider}
          width="25px"
        />
        <Text
          size="small"
          weight={500}
        >{eab.cluster}
        </Text>
      </Box>
      <Box
        width="30%"
        direction="row"
        align="center"
      >
        <Box fill="horizontal">
          <Text size="small">{moment(eab.insertedAt).format('lll')}</Text>
        </Box>
        <DeleteCredential eab={eab} />
      </Box>
    </TableRow>
  )
}

export function EabCredentials() {
  const { data } = useQuery(EAB_CREDENTIALS, { fetchPolicy: 'cache-and-network' })

  if (!data) return null

  return (
    <Box fill>
      <EabCredentialHeader />
      {data.eabCredentials.map(eab => (
        <EabCredential
          key={eab.id}
          eab={eab}
        />
      ))}
    </Box>
  )
}
