import { useCallback, useContext, useState } from 'react'
import { useMutation } from '@apollo/client'
import {
  Chip,
  FormField,
  Input,
  Modal,
  WarningIcon,
} from '@pluralsh/design-system'
import {
  A,
  Button,
  Flex,
  Span,
} from 'honorable'

import { DELETE_DEMO_PROJECT_MUTATION, DELETE_SHELL_MUTATION } from '../../../queries'
import CurrentUserContext from '../../../../../contexts/CurrentUserContext'

function DeleteShellModal({ onClose }) {
  const { demoing } = useContext(CurrentUserContext)
  const [open, setOpen] = useState(true)
  const [canDelete, setCanDelete] = useState(false)
  const [deleteShell, { loading: deleteShellLoading }] = useMutation(DELETE_SHELL_MUTATION)
  const [deleteDemoProjectWithShell, { loading: deleteDemoProjectLoading }] = useMutation(DELETE_DEMO_PROJECT_MUTATION)

  const close = useCallback(() => {
    setOpen(false)
    onClose()
  }, [onClose])

  const onDelete = useCallback(() => {
    if (demoing) {
      deleteDemoProjectWithShell().then(() => window.location.reload())

      return
    }

    deleteShell().then(() => window.location.reload())
  }, [deleteDemoProjectWithShell, deleteShell, demoing])

  return (
    <Modal
      size="large"
      open={open}
      onClose={close}
      style={{ padding: 0 }}
      borderTop="4px solid border-warning"
    >
      <Flex
        direction="column"
        gap="large"
      >
        <Flex gap="medium">
          <WarningIcon color="icon-warning" />
          <Span
            body2
            color="text-xlight"
          >CONFIRM DELETION
          </Span>
        </Flex>

        <Flex
          direction="column"
          gap="large"
        >
          <Span body1>This action deletes the cloud shell, not your entire cluster.</Span>
          <Span body1>If you wish to destroy your entire cluster please run&nbsp;
            <Chip
              size="small"
              background="fill-one"
            >
              plural destroy
            </Chip>
            before completing this action. You can learn more&nbsp;
            <A
              data-phid="delete-shell-learn-more"
              inline
              href="https://docs.plural.sh/operations/uninstall"
              target="_blank"
            >here
            </A>.
          </Span>
        </Flex>

        <Flex
          direction="column"
          gap="xsmall"
        >
          <FormField label="Type 'delete' to confirm">
            <Input
              placeholder="delete"
              required
              onChange={({ target: { value } }) => (value === 'delete' ? setCanDelete(true) : setCanDelete(false))}
            />
          </FormField>
        </Flex>

        <Flex
          justify="flex-end"
          gap="medium"
        >
          <Button
            data-phid="delete-shell-cancel"
            secondary
            onClick={close}
          >Cancel
          </Button>
          <Button
            data-phid="delete-shell-confirm"
            destructive
            disabled={!canDelete}
            onClick={() => onDelete()}
            loading={deleteShellLoading || deleteDemoProjectLoading}
          >Delete
          </Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

export { DeleteShellModal }
