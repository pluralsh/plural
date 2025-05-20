import { ListBoxItem, Select } from '@pluralsh/design-system'
import ConsoleInstancesContext from 'contexts/ConsoleInstancesContext'
import { useContext, useState } from 'react'

export function PluralCloudInstanceDropdown({
  initialId,
  onChange,
}: {
  initialId: Nullable<string>
  onChange: (id: string) => void
}) {
  const { instances } = useContext(ConsoleInstancesContext)
  const [selectedId, setSelectedId] = useState(initialId)

  return (
    <Select
      label="Select an instance"
      selectedKey={selectedId}
      onSelectionChange={(key) => {
        setSelectedId(`${key}`)
        onChange(`${key}`)
      }}
    >
      {instances.map((instance) => (
        <ListBoxItem
          key={instance.id}
          label={instance.name}
        />
      ))}
    </Select>
  )
}
