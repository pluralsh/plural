import { CloudIcon, ListBoxItem, TrashCanIcon } from '@pluralsh/design-system'
import { MoreMenu } from 'components/account/MoreMenu'
import ConsoleInstancesContext from 'contexts/ConsoleInstancesContext'
import { ConsoleInstanceFragment } from 'generated/graphql'
import { useCallback, useContext, useState } from 'react'
import { DeleteInstanceModal } from '../DeleteInstance'
import { EditInstanceSizeModal } from '../EditInstance'

enum MenuItemKey {
  EditSize = 'editSize',
  Delete = 'delete',
}

export function PluralCloudInstanceMoreMenu({
  instance,
}: {
  instance: Nullable<ConsoleInstanceFragment>
}) {
  const [menuKey, setMenuKey] = useState<Nullable<string>>('')
  const { refetchInstances } = useContext(ConsoleInstancesContext)
  const onClose = useCallback(() => setMenuKey(''), [])

  if (!instance) return null

  return (
    <>
      <MoreMenu
        secondary
        onSelectionChange={(newKey) => setMenuKey(newKey)}
        buttonProps={{ small: false, width: 40, height: 40 }}
      >
        <ListBoxItem
          key={MenuItemKey.EditSize}
          label="Edit cloud instance size"
          leftContent={<CloudIcon />}
        />
        <ListBoxItem
          key={MenuItemKey.Delete}
          destructive
          label="Delete instance"
          leftContent={<TrashCanIcon color="icon-danger" />}
        />
      </MoreMenu>
      <EditInstanceSizeModal
        open={menuKey === MenuItemKey.EditSize}
        onClose={onClose}
        refetch={refetchInstances}
        instance={instance}
      />
      <DeleteInstanceModal
        open={menuKey === MenuItemKey.Delete}
        onClose={onClose}
        refetch={refetchInstances}
        instance={instance}
      />
    </>
  )
}
