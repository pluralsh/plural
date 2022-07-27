import { useMutation, useQuery } from '@apollo/client'
import { Box } from 'grommet'
import moment from 'moment'
import { useState } from 'react'

import { PageTitle } from 'pluralsh-design-system'

import { updateCache } from '../../utils/graphql'
import { Confirm } from '../account/Confirm'

import { DELETE_EAB_CREDENTIALS, EAB_CREDENTIALS } from '../users/queries'
import { obscure } from '../users/utils'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { Container } from '../utils/Container'
import { Table, TableData, TableRow } from '../utils/Table'

import { DeleteIcon } from './Icon'

function EabCredential({ credential, last }) {
  const [confirm, setConfirm] = useState(false)
  const [mutation, { loading, error }] = useMutation(DELETE_EAB_CREDENTIALS, {
    variables: { id: credential.id },
    update: (cache, { data: { deleteEabKey } }) => updateCache(cache, {
      query: EAB_CREDENTIALS,
      update: prev => ({ ...prev, eabCredentials: prev.eabCredentials.filter(({ id }) => id !== deleteEabKey.id) }),
    }),
    onCompleted: () => setConfirm(false),
  })

  return (
    <>
      <TableRow
        suffix={<DeleteIcon onClick={() => setConfirm(true)} />}
        last={last}
      >
        <TableData>{credential.keyId}</TableData>
        <TableData>{obscure(credential.hmacKey)}</TableData>
        <TableData>{credential.provider}/{credential.cluster}</TableData>
        <TableData>{moment(credential.insertedAt).format('lll')}</TableData>
      </TableRow>
      <Confirm
        open={confirm}
        title="Delete these EAB Credentials"
        text="Are you sure you want to remove this EAB credential set?  This action is permanent."
        close={() => setConfirm(false)}
        submit={mutation}
        loading={loading}
        destructive
        error={error}
      />
    </>
  )
}

export function EabCredentials() {
  const { data } = useQuery(EAB_CREDENTIALS, { fetchPolicy: 'cache-and-network' })

  if (!data) return <LoopingLogo />

  const len = data.eabCredentials.length

  return (
    <Container type="table">
      <Box
        gap="medium"
        fill
      >
        <PageTitle heading="EAB credentials" />
        <Box fill>
          <Table
            headers={['Key Id', 'HMAC Key', 'Cluster', 'Created On']}
            sizes={['25%', '25%', '25%', '25%']}
            background="fill-one"
            border="1px solid border"
          >
            {data.eabCredentials.map((cred, i) => (
              <EabCredential
                key={cred.id}
                credential={cred}
                last={i === len - 1}
              />
            ))}
          </Table>
        </Box>
      </Box>
    </Container>
  )
}
