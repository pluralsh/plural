import {
  Chip,
  CloudIcon,
  Codeline,
  DownloadIcon,
  FormField,
  InfoOutlineIcon,
  Input,
  ListBoxItem,
  Modal,
  MoreIcon,
  Select,
  TrashCanIcon,
  WarningIcon,
} from '@pluralsh/design-system'
import {
  A,
  Button,
  Flex,
  Span,
} from 'honorable'
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useMutation, useQuery } from '@apollo/client'
import GitUrlParse from 'git-url-parse'

import { SHELL_CONFIGURATION_QUERY } from '../queries'
import { DELETE_SHELL_MUTATION } from '../../queries'

function CloudInfoModal({ onClose }) {
  const [open, setOpen] = useState(true)
  const { data: { shellConfiguration } } = useQuery(SHELL_CONFIGURATION_QUERY)
  const [gitUrl, setGitUrl] = useState<{name: string, organization: string}>()

  const close = useCallback(() => {
    setOpen(false)
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!shellConfiguration) return

    setGitUrl(GitUrlParse(shellConfiguration.git.url))
  }, [shellConfiguration])

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
      >
        <Span
          body2
          color="text-xlight"
        >CLOUD SHELL INFO
        </Span>
        <Span body1>The Plural-hosted cloud shell allows you to access your cluster’s git repository without syncing locally. </Span>
        <Flex
          direction="column"
          gap="medium"
        >
          <FormField
            label="GitHub organization"
            hint={(
              <Span
                caption
                color="text-xlight"
              >
                <A
                  inline
                  href="https://www.plural.sh/contact"
                  target="_blank"
                >Contact us
                </A>
                &nbsp;for support if you need to change the Git repo owner.
              </Span>
            )}
          >
            <Input
              placeholder="organization"
              value={gitUrl?.organization}
              disabled
            />
          </FormField>

          <FormField label="GitHub repo">
            <Input
              placeholder="repository"
              value={gitUrl?.name}
              disabled
            />
          </FormField>
        </Flex>
        <Flex justify="flex-end">
          <Button onClick={close}>Okay</Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

function CloudCredentialsModal({ onClose }) {
  const [open, setOpen] = useState(true)
  const close = useCallback(() => {
    setOpen(false)
    onClose()
  }, [onClose])

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
      >
        <Span
          body2
          color="text-xlight"
        >UPDATE CLOUD CREDENTIALS
        </Span>

        <Flex direction="column">
          <Flex direction="column">
            <FormField label="Cloud provider">
              <Input placeholder="provider" />
            </FormField>

            <FormField label="Cloud provider">
              <Input placeholder="provider" />
            </FormField>

            <FormField label="Cloud provider">
              <Input placeholder="provider" />
            </FormField>

            <FormField label="Cloud provider">
              <Input placeholder="provider" />
            </FormField>
          </Flex>
        </Flex>

        <Flex
          justify="flex-end"
          gap="medium"
        >
          <Button secondary>Cancel</Button>
          <Button>Update</Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

function SyncShellModal({ onClose }) {
  const [open, setOpen] = useState(true)
  const close = useCallback(() => {
    setOpen(false)
    onClose()
  }, [onClose])

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
      >
        <Span
          body2
          color="text-xlight"
        >SYNC LOCALLY
        </Span>
        <Flex
          direction="column"
          gap="large"
        >
          <Span body1>If you want to work with Plural in your local shell environment, follow the steps below. Note that you must have the&nbsp;
            <A
              inline
              href="https://docs.plural.sh/getting-started/quickstart"
              target="_blank"
            >Plural CLI
            </A>
            &nbsp;installed to do this successfully.
          </Span>
          <Flex
            gap="small"
            direction="column"
          >
            <Span body1>1. Run this command in your local environment.</Span>
            <Codeline background="fill-two">plural shell sync</Codeline>
          </Flex>

          <Flex
            gap="small"
            direction="column"
          >
            <Span body1>2. Run this command in the cloud shell to destroy this cloud shell environment.</Span>
            <Codeline background="fill-two">plural shell purge</Codeline>
          </Flex>
        </Flex>
        <Flex justify="flex-end">
          <Button onClick={close}>Okay</Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

function DeleteShellModal({ onClose }) {
  const [open, setOpen] = useState(true)
  const [canDelete, setCanDelete] = useState(false)
  const [deleteShell] = useMutation(DELETE_SHELL_MUTATION)

  const close = useCallback(() => {
    setOpen(false)
    onClose()
  }, [onClose])

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
            secondary
            onClick={close}
          >Cancel
          </Button>
          <Button
            destructive
            disabled={!canDelete}
            onClick={() => deleteShell().then(() => window.location.reload())}
          >Delete
          </Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

enum DialogSelection {
  CloudInfo = 'cloudInfo',
  CloudCredentials = 'cloudCredentials',
  SyncShell = 'syncShell',
  DeleteShell = 'deleteShell',
}

const MoreMenuButton = forwardRef<any, any>((props, ref) => (
  <Button
    ref={ref}
    secondary
    width={32}
    height={32}
    small
    {...props}
  ><MoreIcon />
  </Button>
))

function MoreOptions() {
  const [selected, setSelected] = useState<DialogSelection | undefined>()
  const dialog = useMemo(() => {
    switch (selected) {
    case DialogSelection.CloudInfo:
      return <CloudInfoModal onClose={() => setSelected(undefined)} />
    case DialogSelection.CloudCredentials:
      return <CloudCredentialsModal onClose={() => setSelected(undefined)} />
    case DialogSelection.SyncShell:
      return <SyncShellModal onClose={() => setSelected(undefined)} />
    case DialogSelection.DeleteShell:
      return <DeleteShellModal onClose={() => setSelected(undefined)} />
    }
  }, [selected])

  const menuItems = {
    cloudInfo: {
      label: 'Cloud info',
      onSelect: () => setSelected(DialogSelection.CloudInfo),
      props: {
        textAlign: 'start',
        leftContent: <Flex><InfoOutlineIcon /></Flex>,
      },
    },
    // cloudCredentials: {
    //   label: 'Cloud credentials',
    //   onSelect: () => setSelected(DialogSelection.CloudCredentials),
    //   props: {
    //     leftContent: <Flex><CloudIcon /></Flex>,
    //   },
    // },
    syncShell: {
      label: 'Sync shell locally',
      onSelect: () => setSelected(DialogSelection.SyncShell),
      props: {
        leftContent: <Flex><DownloadIcon /></Flex>,
      },
    },
    deleteShell: {
      label: 'Delete cloud shell',
      onSelect: () => setSelected(DialogSelection.DeleteShell),
      props: {
        leftContent: <Flex><TrashCanIcon color="icon-danger" /></Flex>,
      },
    },
  }

  return (
    <>
      <Select
        onSelectionChange={selectedKey => menuItems[selectedKey]?.onSelect()}
        selectedKey={null}
        width="max-content"
        placement="right"
        triggerButton={<MoreMenuButton />}
      >
        {Object.entries(menuItems).map(([key, { label, props = {} }]) => (
          <ListBoxItem
            key={key}
            textValue={label}
            label={label}
            style={{ textAlign: 'start' }}
            {...props}
          />
        ))}
      </Select>
      {!!selected && dialog}
    </>
  )
}

export { MoreOptions }
