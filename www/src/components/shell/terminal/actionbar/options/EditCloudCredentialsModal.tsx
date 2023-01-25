// TODO: Finish once API for shell update is added
import { useCallback, useState } from 'react'
import { Modal } from '@pluralsh/design-system'
import { Button, Flex } from 'honorable'

import { CloudProps } from '../../../onboarding/context/types'

import Provider from './provider/Provider'

function EditCloudCredentialsModal({ onClose }) {
  const [open, setOpen] = useState(true)
  const [providerProps, setProviderProps] = useState<CloudProps>({})
  const close = useCallback(() => {
    setOpen(false)
    onClose()
  }, [onClose])
  const onUpdate = useCallback(() => {}, [])

  console.log(providerProps)

  return (
    <Modal
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
        <Provider setProps={setProviderProps} />

        <Flex
          justify="flex-end"
          gap="medium"
        >
          <Button secondary>Cancel</Button>
          <Button onClick={onUpdate}>Update</Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

export { EditCloudCredentialsModal }
