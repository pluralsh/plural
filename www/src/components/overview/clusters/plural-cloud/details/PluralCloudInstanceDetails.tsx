import {
  ArrowTopRightIcon,
  Button,
  Card,
  EmptyState,
  Flex,
  IconFrame,
  ReturnIcon,
  SubTab,
  TabList,
  TabPanel,
  useSetBreadcrumbs,
  WrapWithIf,
} from '@pluralsh/design-system'
import { GqlError } from 'components/utils/Alert'
import ImpersonateServiceAccount from 'components/utils/ImpersonateServiceAccount'
import LoadingIndicator from 'components/utils/LoadingIndicator'
import { ProviderIcon } from 'components/utils/ProviderIcon'
import { POLL_INTERVAL } from 'components/utils/useFetchPaginatedData'
import { ConsoleInstanceType, useConsoleInstanceQuery } from 'generated/graphql'
import { ReactNode, Suspense, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'
import { HostingChip, StatusChip } from '../CloudInstanceTableCols'
import { EditPluralOIDCClients } from '../EditPluralOIDCClients'
import {
  CLOUD_INSTANCES_BREADCRUMBS,
  PLURAL_CLOUD_INSTANCES_PATH_ABS,
} from '../PluralCloudInstances'
import { PluralCloudInstanceLoginSettings } from './login-settings/PluralCloudInstanceLoginSettings'
import { PluralCloudInstanceNetworkPolicy } from './network-policy/PluralCloudInstanceNetworkPolicy'
import { PluralCloudInstanceClusterPermissions } from './PluralCloudInstanceClusterPermissions'
import { PluralCloudInstanceDropdown } from './PluralCloudInstanceDropdown'
import { PluralCloudInstanceMoreMenu } from './PluralCloudInstanceMoreMenu'

export const INSTANCE_ID_PARAM = 'instanceId'

const getBreadcrumbs = (name: string, instanceId: string) => [
  ...CLOUD_INSTANCES_BREADCRUMBS,
  { label: name, url: `${PLURAL_CLOUD_INSTANCES_PATH_ABS}/${instanceId}` },
]

enum Tab {
  LoginSettings = 'Login settings',
  OIDCProviders = 'OIDC providers',
  ClusterPermissions = 'Cluster permissions',
  NetworkPolicy = 'Network policy',
}

export function PluralCloudInstanceDetails() {
  const navigate = useNavigate()
  const { instanceId } = useParams()
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.LoginSettings)

  const { data, loading, error } = useConsoleInstanceQuery({
    variables: { id: instanceId ?? '' },
    fetchPolicy: 'cache-and-network',
    pollInterval: POLL_INTERVAL,
  })
  const instance = data?.consoleInstance

  useSetBreadcrumbs(
    useMemo(
      () => getBreadcrumbs(instance?.name ?? '', instanceId ?? ''),
      [instance?.name, instanceId]
    )
  )

  return (
    <Flex
      gap="large"
      direction="column"
      height="100%"
      width="100%"
    >
      <HeaderSC>
        <Flex gap="xsmall">
          <IconFrame
            clickable
            as={Link}
            to={PLURAL_CLOUD_INSTANCES_PATH_ABS}
            size="large"
            type="secondary"
            tooltip="Back to all instances"
            icon={<ReturnIcon width={16} />}
          />
          <PluralCloudInstanceDropdown
            initialId={instanceId}
            onChange={(id) =>
              navigate(`${PLURAL_CLOUD_INSTANCES_PATH_ABS}/${id}`)
            }
          />
        </Flex>
        <Flex gap="small">
          {instance?.console?.consoleUrl && (
            <Button
              as={Link}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<ArrowTopRightIcon />}
              to={`${instance.console.consoleUrl}`}
            >
              Launch Console
            </Button>
          )}
          <PluralCloudInstanceMoreMenu instance={instance} />
        </Flex>
      </HeaderSC>
      {!instance ? (
        loading ? (
          <LoadingIndicator />
        ) : error ? (
          <GqlError error={error} />
        ) : (
          <EmptyState message="Instance not found" />
        )
      ) : (
        <>
          <BasicInfoCardSC>
            <InfoCardField
              label="instance name"
              value={instance.name}
            />
            <InfoCardField
              label="status"
              value={<StatusChip status={instance.status} />}
            />
            <InfoCardField
              label="cloud"
              value={
                <Flex gap="xsmall">
                  <IconFrame
                    size="small"
                    type="floating"
                    icon={
                      <ProviderIcon
                        provider={instance.cloud}
                        width={16}
                      />
                    }
                  />
                  {instance.cloud}
                </Flex>
              }
            />
            <InfoCardField
              label="hosting"
              value={<HostingChip type={instance.type} />}
            />
          </BasicInfoCardSC>
          <Suspense fallback={<LoadingIndicator />}>
            <WrapWithIf
              condition={currentTab !== Tab.ClusterPermissions}
              wrapper={
                <ImpersonateServiceAccount
                  id={instance?.owner?.id}
                  skip={!instance?.owner?.serviceAccount}
                />
              }
            >
              <SettingsViews
                instanceId={instance.id}
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
              />
            </WrapWithIf>
          </Suspense>
        </>
      )}
    </Flex>
  )
}

function SettingsViews({
  instanceId,
  currentTab,
  setCurrentTab,
}: {
  instanceId: string
  currentTab: Tab
  setCurrentTab: (tab: Tab) => void
}) {
  const tabStateRef = useRef<any>(null)

  // have to call this again because ImpersonateServiceAccount changes its children's apollo client
  const { data, loading, error } = useConsoleInstanceQuery({
    variables: { id: instanceId ?? '' },
    fetchPolicy: 'cache-and-network',
    pollInterval: POLL_INTERVAL,
  })
  const instance = data?.consoleInstance

  if (!data && loading) return <LoadingIndicator />
  if (error) return <GqlError error={error} />
  if (!instance) return <EmptyState message="Instance not found" />

  return (
    <>
      <TabList
        stateRef={tabStateRef}
        stateProps={{
          orientation: 'horizontal',
          selectedKey: currentTab,
          onSelectionChange: (key) => setCurrentTab(`${key}` as Tab),
        }}
        css={{ textWrap: 'nowrap' }}
      >
        {Object.values(Tab)
          // only show network policy for dedicated instances
          .filter((value) =>
            instance.type === ConsoleInstanceType.Dedicated
              ? true
              : value !== Tab.NetworkPolicy
          )
          .map((value) => (
            <SubTab key={value}>{value}</SubTab>
          ))}
      </TabList>
      <TabPanel
        stateRef={tabStateRef}
        css={{ height: '100%' }}
      >
        {currentTab === Tab.LoginSettings && (
          <PluralCloudInstanceLoginSettings instance={instance} />
        )}
        {currentTab === Tab.ClusterPermissions && (
          <PluralCloudInstanceClusterPermissions instance={instance} />
        )}
        {currentTab === Tab.OIDCProviders && (
          <EditPluralOIDCClients instanceName={instance.name} />
        )}
        {currentTab === Tab.NetworkPolicy && (
          <PluralCloudInstanceNetworkPolicy instance={instance} />
        )}
      </TabPanel>
    </>
  )
}

const HeaderSC = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}))

const BasicInfoCardSC = styled(Card)(({ theme }) => ({
  ...theme.partials.text.body1Bold,
  display: 'flex',
  gap: theme.spacing.small,
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing.large,
}))

function InfoCardField({ label, value }: { label: string; value: ReactNode }) {
  const theme = useTheme()
  return (
    <Flex
      flex={1}
      direction="column"
      gap="xxsmall"
    >
      <span
        css={{
          ...theme.partials.text.overline,
          color: theme.colors['text-xlight'],
          width: 'max-content',
        }}
      >
        {label}
      </span>
      {value}
    </Flex>
  )
}
