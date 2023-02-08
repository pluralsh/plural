import {
  CloudIcon,
  DownloadIcon,
  InfoOutlineIcon,
  ListBoxItem,
  MoreIcon,
  Select,
  TrashCanIcon,
} from '@pluralsh/design-system'
import { Button, Flex } from 'honorable'
import { forwardRef, useMemo, useState } from 'react'

import { CloudInfoModal } from './CloudInfoModal'
import { SyncShellModal } from './SyncShellModal'
import { DeleteShellModal } from './DeleteShellModal'
import { EditCloudCredentialsModal } from './EditCloudCredentialsModal'

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
      return <EditCloudCredentialsModal onClose={() => setSelected(undefined)} />
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
    cloudCredentials: {
      label: 'Cloud credentials',
      onSelect: () => setSelected(DialogSelection.CloudCredentials),
      props: {
        leftContent: <Flex><CloudIcon /></Flex>,
      },
    },
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
