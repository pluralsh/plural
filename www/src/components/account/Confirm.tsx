import { ReactNode } from 'react'
import { ApolloError } from '@apollo/client'
import { Div } from 'honorable'
import { Button, Modal } from 'pluralsh-design-system'

import { GqlError } from '../utils/Alert'

type ConfirmProps = {
  open: boolean
  close: (...args: any[]) => unknown
  title?: ReactNode
  error?: ApolloError
  text?: ReactNode
  submit: (...args: any[]) => unknown
  label?: ReactNode
  loading?: boolean
  destructive?: boolean
}

export function Confirm({
  open,
  close,
  title = 'Are you sure?',
  error,
  text,
  submit,
  label,
  loading = false,
  destructive = false,
}: ConfirmProps) {
  return (
    <Modal
      header={title}
      open={open}
      onClose={close}
      width="512px"
      portal
      actions={(
        <>
          <Button
            secondary
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            destructive={destructive}
            onClick={submit}
            loading={loading}
            marginLeft="medium"
          >
            {label || 'Confirm'}
          </Button>
        </>
      )}
    >
      {error ? (
        <GqlError
          error={error}
          header="Something went wrong"
        />
      ) : (
        <Div
          body1
          color="text"
        >{text}
        </Div>
      )}
    </Modal>
  )
}
