import { useMutation, useQuery } from '@apollo/client'
import { Box } from 'grommet'
import { useState } from 'react'

import { InfoIcon, PageTitle, Tooltip } from 'pluralsh-design-system'

import { Span } from 'honorable'

import { updateCache } from '../../utils/graphql'
import { Confirm } from '../account/Confirm'

import { DELETE_EAB_CREDENTIALS, EAB_CREDENTIALS } from '../users/queries'
import { obscure } from '../users/utils'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { Table, TableData, TableRow } from '../utils/Table'

import { Date } from '../utils/Date'

import { DeleteIconButton } from '../utils/IconButtons'

const TOOLTIP = 'EAB credentials are used to generate an ACME account for certificate issuance in your clusters. '
  + 'These should be recycled on `plural destroy`.'

function EabCredential({ credential, last }: any) {
  const [confirm, setConfirm] = useState(false)
  const [mutation, { loading, error }] = useMutation(DELETE_EAB_CREDENTIALS, {
    variables: { id: credential.id },
    // @ts-expect-error
    update: (cache, { data: { deleteEabKey } }) => updateCache(cache, {
      query: EAB_CREDENTIALS,
      update: prev => ({ ...prev, eabCredentials: prev.eabCredentials.filter(({ id }) => id !== deleteEabKey.id) }),
    }),
    onCompleted: () => setConfirm(false),
  })

  return (
    <>
      <TableRow
        suffix={<DeleteIconButton onClick={() => setConfirm(true)} />}
        last={last}
      >
        <TableData>{credential.keyId}</TableData>
        <TableData>{obscure(credential.hmacKey)}</TableData>
        <TableData>{credential.provider}/{credential.cluster}</TableData>
        <TableData><Date date={credential.insertedAt} /></TableData>
      </TableRow>
      <Confirm
        open={confirm}
        title="Delete these EAB Credentials"
        text="Are you sure you want to remove this EAB credential set?  This action is permanent."
        close={() => setConfirm(false)}
        submit={() => mutation()}
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

  return (
    <Box fill>
      <PageTitle
        heading="EAB credentials"
        justifyContent="flex-start"
      >
        <Tooltip
          width="315px"
          label={TOOLTIP}
        >
          <Box
            flex={false}
            pad="6px"
            round="xxsmall"
            hoverIndicator="fill-two"
          >
            <InfoIcon />
          </Box>
        </Tooltip>
      </PageTitle>
      <Box fill>
        {data.eabCredentials?.length
          ? (
            <Table
              headers={['Key ID', 'HMAC key', 'Cluster', 'Created']}
              sizes={['27%', '27%', '26%', '20%']}
              background="fill-one"
              border="1px solid border"
            >
              {data.eabCredentials.map((c, i, a) => (
                <EabCredential
                  key={c.id}
                  credential={c}
                  last={i === a.length - 1}
                />
              ))}
            </Table>
          ) : (<Span>You do not have any EAB credentials keys yet.</Span>)}
      </Box>
    </Box>
  )
}
