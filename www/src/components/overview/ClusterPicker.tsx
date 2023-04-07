import {
  ClusterIcon,
  FormField,
  ListBoxItem,
  Select,
} from '@pluralsh/design-system'
import { Dispatch, useContext, useEffect } from 'react'

import ClustersContext from '../../contexts/ClustersContext'
import { ProviderIcon } from '../utils/ProviderIcon'
import { Cluster } from '../../generated/graphql'

type ClusterPickerProps = {
    cluster: Cluster | undefined
    setCluster: Dispatch<Cluster | undefined>
    heading?: string
    title?: any
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
}

export function ClusterPicker({
  cluster, setCluster, heading, title, size = 'medium', disabled = false,
}: ClusterPickerProps) {
  const { clusters } = useContext(ClustersContext)

  // Update selected cluster object each time clusters will be updated.
  useEffect(() => {
    setCluster(clusters.find(({ id }) => id === cluster?.id))
  }, [clusters]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FormField label={heading}>
      <Select
        label="Select cluster"
        selectedKey={cluster?.id}
        onSelectionChange={id => setCluster(clusters.find(c => c.id === id))}
        size={size}
        isDisabled={disabled}
        titleContent={title}
        leftContent={(
          cluster ? (
            <ProviderIcon
              provider={cluster?.provider}
              width={16}
            />
          ) : <ClusterIcon />
        )}
      >
        {clusters.map(({ id, name, provider }) => (
          <ListBoxItem
            key={id}
            label={name}
            textValue={name}
            leftContent={(
              <ProviderIcon
                provider={provider}
                width={16}
              />
            )}
          />
        ))}
      </Select>
    </FormField>
  )
}
