import { useCallback, useEffect, useState } from 'react'
import { GraphQLToast, LoopingLogo, Modal } from '@pluralsh/design-system'
import { Button, Flex, Span } from 'honorable'
import { ServerError, useMutation, useQuery } from '@apollo/client'

import { CloudProps, CloudProvider } from '../../../onboarding/context/types'
import { CLOUD_SHELL_QUERY } from '../../../queries'
import { UPDATE_SHELL_MUTATION } from '../../queries'

import { CloudShellAttributes, WorkspaceAttributes } from '../../../../../generated/graphql'

import Provider from './provider/Provider'

function EditCloudCredentialsModal({ onClose }) {
  const [open, setOpen] = useState(true)
  const [provider, setProvider] = useState<CloudProvider>()
  const [providerProps, setProviderProps] = useState<CloudProps>({})
  const [valid, setValid] = useState(false)

  const { data: { shell } } = useQuery(CLOUD_SHELL_QUERY)
  const [updateShell, { error: updateShellError }] = useMutation(UPDATE_SHELL_MUTATION, {
    variables: {
      attributes: {
        // Workspace is ignored by the update query, so just fill with empty data.
        workspace: {
          subdomain: '',
          region: '',
          cluster: '',
          bucketPrefix: '',
        } as WorkspaceAttributes,
        credentials: providerProps,
      } as CloudShellAttributes,
    },
  })

  const close = useCallback(() => {
    setOpen(false)
    onClose()
  }, [onClose])
  const onUpdate = useCallback(() => {}, [updateShell])

  useEffect(() => {
    if (!shell) return

    const provider = shell.provider?.toLowerCase()

    setProvider(provider)
  }, [shell])

  return (
    <>
      {updateShellError && (
        <GraphQLToast
          error={{ graphQLErrors: [...updateShellError.graphQLErrors] }}
          header={`${(updateShellError.networkError as ServerError)?.statusCode}` || 'Error'}
          margin="medium"
          marginHorizontal="xxxxlarge"
        />
      )}
      <Modal
        BackdropProps={{ zIndex: 20 }}
        size="large"
        open={open}
        onClose={close}
        style={{ padding: 0 }}
      >
        <Flex
          direction="column"
          gap="large"
          justify="space-between"
          height="100%"
        >
          <Span
            body2
            color="text-xlight"
          >UPDATE CLOUD CREDENTIALS
          </Span>
          {(!shell || !provider) && (
            <Flex
              align="center"
              justify="center"
              flexGrow={1}
            ><LoopingLogo />
            </Flex>
          )}
          {shell && provider && (
            <>
              <Provider
                props={providerProps}
                provider={provider}
                setProps={setProviderProps}
                setValid={setValid}
              />

              <Flex
                justify="flex-end"
                gap="medium"
              >
                <Button
                  secondary
                  onClick={close}
                >Cancel
                </Button>
                <Button
                  onClick={onUpdate}
                  disabled={!valid}
                >Update
                </Button>
              </Flex>
            </>
          )}
        </Flex>
      </Modal>
    </>
  )
}

export { EditCloudCredentialsModal }
