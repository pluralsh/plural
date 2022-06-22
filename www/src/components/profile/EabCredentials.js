import { useMutation, useQuery } from '@apollo/client'
import { Box } from 'grommet'
import moment from 'moment'
import { Button, Modal, ModalActions } from 'pluralsh-design-system'
import { useState } from 'react'

import { updateCache } from '../../utils/graphql'

import { DELETE_EAB_CREDENTIALS, EAB_CREDENTIALS } from '../users/queries'
import { obscure } from '../users/utils'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { Table, TableData, TableRow } from '../utils/Table'

import { Header } from './Header'
import { DeleteIcon } from './Icon'

function EabCredential({ credential, last }) {
  const [confirm, setConfirm] = useState(false)
  const [mutation, { loading }] = useMutation(DELETE_EAB_CREDENTIALS, {
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
      <Modal
        open={confirm}
        title="Delete this EAB Credentials"
        onClose={() => setConfirm(false)}
      >
        Are you sure you want to remove this EAB credential?  This action is permanent.
        <ModalActions>
          <Button
            secondary
            onClick={() => setConfirm(false)}
          >Cancel
          </Button>
          <Button
            onClick={mutation}
            loading={loading}
            marginLeft="medium"
            background="icon-error"
          >Remove
          </Button>
        </ModalActions>
      </Modal>
    </>
  )
}

export function EabCredentials() {
  const { data } = useQuery(EAB_CREDENTIALS, { fetchPolicy: 'cache-and-network' })

  if (!data) return <LoopingLogo />

  const len = data.eabCredentials.length

  return (
    <Box
      gap="medium"
      fill
    >
      <Header
        header="EAB Credentials"
        description="Credentials used to generate an ACME account for certificate issuance in plural clusters"
      />
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
  )
}
