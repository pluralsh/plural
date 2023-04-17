import {
  Chip,
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
import { isEmpty } from 'lodash'

import ClustersContext from '../../contexts/ClustersContext'
import { Cluster, Maybe, UpgradeInfo } from '../../generated/graphql'

import { ProviderIcon } from './ProviderIcon'

type ClusterPickerReadyChipProps = {upgradeInfo?: Maybe<UpgradeInfo>[] | null}

function ClusterPickerReadyChip({ upgradeInfo }: ClusterPickerReadyChipProps) {
  const ready = useMemo(() => isEmpty(upgradeInfo), [upgradeInfo])

  return (
    <Chip
      severity={ready ? 'success' : 'error'}
      size="small"
      hue="lightest"
    >
      {ready ? 'Ready' : 'Pending'}
    </Chip>
  )
}

type ClusterPickerProps = {
    cluster: Cluster | undefined
    setCluster: Dispatch<Cluster | undefined>
    filter?: (Cluster) => boolean
    heading?: string
    title?: any
    placeholder?: string
    showUpgradeInfo?: boolean
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
  showUpgradeInfo = false,
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
        rightContent={showUpgradeInfo && cluster && <ClusterPickerReadyChip upgradeInfo={cluster.upgradeInfo} />}
      >
        {clusters.map(({
          id, name, provider, upgradeInfo,
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
            rightContent={showUpgradeInfo && <ClusterPickerReadyChip upgradeInfo={upgradeInfo} />}
          />
        ))}
      </Select>
    </WrapWithIf>
  )
}
