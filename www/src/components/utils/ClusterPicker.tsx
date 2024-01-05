import {
  Chip,
  ClusterIcon,
  FormField,
  ListBoxItem,
  Select,
  WrapWithIf,
} from '@pluralsh/design-system'
import { Flex } from 'honorable'
import { isEmpty } from 'lodash'
import {
  ComponentProps,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react'

import ClustersContext from '../../contexts/ClustersContext'

import { useCurrentUser } from '../../contexts/CurrentUserContext'
import { Cluster, Maybe, Provider, UpgradeInfo } from '../../generated/graphql'
import ClusterHealth from '../overview/clusters/ClusterHealth'

import { ProviderIcon } from './ProviderIcon'

type ClusterPickerReadyChipProps = { upgradeInfo?: Maybe<UpgradeInfo>[] | null }

function ClusterPickerReadyChip({ upgradeInfo }: ClusterPickerReadyChipProps) {
  const ready = useMemo(() => isEmpty(upgradeInfo), [upgradeInfo])

  return (
    <Chip
      severity={ready ? 'success' : 'danger'}
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

function findById<T extends { id: string }>(clusters: T[], id?: string | null) {
  return clusters.find((cl) => cl?.id === id)
}

export function ClusterPicker({
  filter,
  setCluster,
  cluster,
  onChange,
  ...props
}: ClusterPickerProps) {
  const { clusters: raw } = useContext(ClustersContext)

  const clusters = useMemo(
    () => (raw && filter ? raw.filter(filter) : raw),
    [raw, filter]
  )

  // Update selected cluster object each time clusters will be updated.
  useEffect(() => {
    setCluster?.(findById(clusters, cluster?.id))
  }, [clusters, cluster?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ClusterPickerBase
      clusterId={cluster?.id}
      onChange={(id) => {
        const selection = findById(clusters, id)

        setCluster?.(selection)
        onChange?.(selection)
      }}
      clusters={clusters}
      {...props}
    />
  )
}

type SelectBoxCluster = Pick<Cluster, 'id' | 'name'> &
  Partial<Pick<Cluster, 'pingedAt' | 'provider' | 'upgradeInfo' | 'owner'>> & {
    icon?: ReactNode
  }

type ClusterPickerInnerProps = {
  clusterId?: string | null
  clusters?: SelectBoxCluster[]
  onChange?: (id: string) => void
  heading?: string
  hint?: string
  title?: any
  placeholder?: string
  showUpgradeInfo?: boolean
  showHealthStatus?: boolean
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

function ClusterProviderIcon({
  provider,
  icon,
}: {
  provider?: Provider
  icon?: ReactNode
}) {
  return icon ? (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>{icon}</>
  ) : provider ? (
    <ProviderIcon
      provider={provider}
      width={16}
    />
  ) : (
    <ClusterIcon />
  )
}

function ClusterPickerBase({
  clusterId,
  clusters,
  onChange,
  heading,
  hint,
  title,
  placeholder = 'Select cluster',
  showUpgradeInfo = false,
  showHealthStatus = false,
  size = 'medium',
  disabled = false,
}: ClusterPickerInnerProps) {
  clusters = clusters || []
  const cluster = useMemo(
    () => clusters?.find((cl) => clusterId === cl.id),
    [clusterId, clusters]
  )

  return (
    <WrapWithIf
      condition={!!heading || !!hint}
      wrapper={
        <FormField
          label={heading}
          hint={hint}
        />
      }
    >
      <Select
        label={placeholder}
        selectedKey={clusterId}
        onSelectionChange={(id) => {
          onChange?.(id as string)
        }}
        size={size}
        isDisabled={disabled}
        titleContent={title}
        leftContent={
          <ClusterProviderIcon
            provider={cluster?.provider}
            icon={cluster?.icon}
          />
        }
        rightContent={
          cluster && (
            <Flex gap="xsmall">
              {showUpgradeInfo && (
                <ClusterPickerReadyChip upgradeInfo={cluster.upgradeInfo} />
              )}
              {showHealthStatus && cluster.pingedAt && (
                <ClusterHealth
                  pingedAt={cluster.pingedAt}
                  size="small"
                  hue="lightest"
                />
              )}
            </Flex>
          )
        }
      >
        {clusters.map(
          ({ id, name, owner, provider, pingedAt, upgradeInfo, icon }) => (
            <ListBoxItem
              key={id}
              label={name}
              description={owner?.email}
              textValue={name}
              leftContent={
                <ClusterProviderIcon
                  provider={provider}
                  icon={icon}
                />
              }
              rightContent={
                <Flex gap="xsmall">
                  {showUpgradeInfo && (
                    <ClusterPickerReadyChip upgradeInfo={upgradeInfo} />
                  )}
                  {showHealthStatus && (
                    <ClusterHealth
                      pingedAt={pingedAt}
                      showTooltip={false}
                      size="small"
                      hue="lightest"
                    />
                  )}
                </Flex>
              }
            />
          )
        )}
      </Select>
    </WrapWithIf>
  )
}

type CloudShellClusterPickerProps = Omit<
  ComponentProps<typeof ClusterPickerBase>,
  'clusters'
> & { showCliClusters?: boolean }

export function clusterHasCloudShell(cluster: Cluster) {
  return !!cluster?.owner?.hasShell
}

export function userCanAdminCluster(cluster: Cluster, userId: string) {
  return cluster.owner?.id === userId || !!cluster.owner?.serviceAccount
}

export function clusterFilter(
  cluster: Cluster,
  currentUserId: string,
  { showCliClusters = false }
) {
  // Filter out non-cloud-shell clusters if showCliClusters is off
  if (!showCliClusters && !clusterHasCloudShell(cluster)) {
    return false
  }

  // Filter clusters that user can't install to
  return userCanAdminCluster(cluster, currentUserId)
}

export function CloudShellClusterPicker({
  onChange,
  showCliClusters = false,
  ...props
}: CloudShellClusterPickerProps) {
  const { clusters: raw } = useContext(ClustersContext)
  const { id: userId } = useCurrentUser()

  const clusters = useMemo(
    () =>
      raw
        ? raw.filter((cl) => clusterFilter(cl, userId, { showCliClusters }))
        : ([] as Cluster[]),
    [raw, showCliClusters, userId]
  )

  return (
    <ClusterPickerBase
      onChange={onChange}
      clusters={clusters}
      {...props}
    />
  )
}
