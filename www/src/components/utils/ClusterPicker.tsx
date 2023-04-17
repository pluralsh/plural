import {
  ClusterIcon,
  FormField,
  ListBoxItem,
  Select,
  WrapWithIf,
} from '@pluralsh/design-system'
import {
  Dispatch,
  useContext,
  useEffect,
  useMemo,
} from 'react'

import ClustersContext from '../../contexts/ClustersContext'
import { Cluster } from '../../generated/graphql'

import ClusterHealth from '../overview/clusters/ClusterHealth'

import { ProviderIcon } from './ProviderIcon'

type ClusterPickerProps = {
    cluster: Cluster | undefined
    setCluster: Dispatch<Cluster | undefined>
    filter?: (Cluster) => boolean
    heading?: string
    title?: any
    placeholder?: string
    health?: boolean
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
}

export function ClusterPicker({
  cluster,
  setCluster,
  filter,
  heading,
  title,
  placeholder = 'Select cluster',
  health = false,
  size = 'medium',
  disabled = false,
}: ClusterPickerProps) {
  const { clusters: raw } = useContext(ClustersContext)

  const clusters = useMemo(() => (raw && filter ? raw.filter(filter) : raw), [raw, filter])

  // Update selected cluster object each time clusters will be updated.
  useEffect(() => {
    setCluster(clusters.find(({ id }) => id === cluster?.id))
  }, [clusters]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <WrapWithIf
      condition={!!heading}
      wrapper={<FormField label={heading} />}
    >
      <Select
        label={placeholder}
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
        rightContent={health && cluster && (
          <ClusterHealth
            pingedAt={cluster?.pingedAt}
            size="small"
          />
        )}
      >
        {clusters.map(({
          id, name, provider, pingedAt,
        }) => (
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
            rightContent={health && (
              <ClusterHealth
                pingedAt={pingedAt}
                size="small"
              />
            )}
          />
        ))}
      </Select>
    </WrapWithIf>
  )
}
