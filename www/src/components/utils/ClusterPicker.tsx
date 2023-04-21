import {
  Chip,
  ClusterIcon,
  FormField,
  ListBoxItem,
  Select,
  WrapWithIf,
} from '@pluralsh/design-system'
import {
  ComponentProps,
  Dispatch,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import { isEmpty } from 'lodash'

import { Flex } from 'honorable'

import ClustersContext from '../../contexts/ClustersContext'
import { Cluster, Maybe, UpgradeInfo } from '../../generated/graphql'

import ClusterHealth from '../overview/clusters/ClusterHealth'

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
    cluster?: Cluster | null
    setCluster?: Dispatch<Cluster | undefined>
    onChange?: (Cluster) => void
    filter?: (Cluster) => boolean
    heading?: string
    hint?: string
    title?: any
    placeholder?: string
    showUpgradeInfo?: boolean
    showHealthStatus?: boolean
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
}

export function ClusterPicker({
  cluster,
  setCluster,
  onChange,
  filter,
  heading,
  hint,
  title,
  placeholder = 'Select cluster',
  showUpgradeInfo = false,
  showHealthStatus = false,
  size = 'medium',
  disabled = false,
}: ClusterPickerProps) {
  const { clusters: raw } = useContext(ClustersContext)

  const clusters = useMemo(() => (raw && filter ? raw.filter(filter) : raw), [raw, filter])

  // Update selected cluster object each time clusters will be updated.
  useEffect(() => {
    setCluster?.(clusters.find(({ id }) => id === cluster?.id))
  }, [clusters]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <WrapWithIf
      condition={!!heading || !!hint}
      wrapper={(
        <FormField
          label={heading}
          hint={hint}
        />
      )}
    >
      <Select
        label={placeholder}
        selectedKey={cluster?.id}
        onSelectionChange={id => {
          const selection = clusters.find(c => c.id === id)

          setCluster?.(selection)
          onChange?.(selection)
        }}
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
        rightContent={cluster && (
          <Flex gap="xsmall">
            {showUpgradeInfo && <ClusterPickerReadyChip upgradeInfo={cluster.upgradeInfo} />}
            {showHealthStatus && (
              <ClusterHealth
                pingedAt={cluster.pingedAt}
                size="small"
                hue="lightest"
              />
            )}
          </Flex>
        )}
      >
        {clusters.map(({
          id, name, provider, pingedAt, upgradeInfo,
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
            rightContent={(
              <Flex gap="xsmall">
                {showUpgradeInfo && <ClusterPickerReadyChip upgradeInfo={upgradeInfo} />}
                {showHealthStatus && (
                  <ClusterHealth
                    pingedAt={pingedAt}
                    showTooltip={false}
                    size="small"
                    hue="lightest"
                  />
                )}
              </Flex>
            )}
          />
        ))}
      </Select>
    </WrapWithIf>
  )
}

export function CloudShellClusterPicker({
  filter,
  ...props
}: ComponentProps<typeof ClusterPicker>) {
  return (
    <ClusterPicker
      filter={cluster => !!cluster?.owner?.hasShell
        && (typeof filter !== 'function' || filter(cluster))}
      {...props}
    />
  )
}
