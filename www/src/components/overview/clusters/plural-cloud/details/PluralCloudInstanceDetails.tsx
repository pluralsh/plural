import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  CLOUD_INSTANCES_BREADCRUMBS,
  PLURAL_CLOUD_INSTANCES_PATH_ABS,
} from '../PluralCloudInstances'
import { useConsoleInstanceQuery } from 'generated/graphql'
import { POLL_INTERVAL } from 'components/utils/useFetchPaginatedData'
import LoadingIndicator from 'components/utils/LoadingIndicator'
import { GqlError } from 'components/utils/Alert'
import {
  ArrowTopRightIcon,
  Button,
  Card,
  EmptyState,
  Flex,
  IconFrame,
  theme,
  ReturnIcon,
  SubTab,
  TabList,
  useSetBreadcrumbs,
  TabPanel,
} from '@pluralsh/design-system'
import { ReactNode, useMemo, useRef, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { HostingChip, StatusChip } from '../CloudInstanceTableCols'
import { ProviderIcon } from 'components/utils/ProviderIcon'
import { PluralCloudInstanceDropdown } from './PluralCloudInstanceDropdown'
import { PluralCloudInstanceMoreMenu } from './PluralCloudInstanceMoreMenu'

export const INSTANCE_ID_PARAM = 'instanceId'

const getBreadcrumbs = (name: string, instanceId: string) => [
  ...CLOUD_INSTANCES_BREADCRUMBS,
  { label: name, url: `${PLURAL_CLOUD_INSTANCES_PATH_ABS}/${instanceId}` },
]

enum Tab {
  ConsoleAccess = 'Console access',
  InstanceWriteAccess = 'Instance write access',
  OIDCProviders = 'OIDC providers',
  NetworkPolicy = 'Network policy',
}

export function PluralCloudInstanceDetails() {
  const navigate = useNavigate()
  const { instanceId } = useParams()
  const tabStateRef = useRef<any>(null)
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.ConsoleAccess)

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
          <TabList
            stateRef={tabStateRef}
            stateProps={{
              orientation: 'horizontal',
              selectedKey: currentTab,
              onSelectionChange: (key) => setCurrentTab(`${key}` as Tab),
            }}
          >
            {Object.values(Tab).map((value) => (
              <SubTab key={value}>{value}</SubTab>
            ))}
          </TabList>
          <TabPanel stateRef={tabStateRef}>
            {currentTab === Tab.ConsoleAccess && <div>Console access</div>}
            {currentTab === Tab.InstanceWriteAccess && (
              <div>Instance write access</div>
            )}
            {currentTab === Tab.OIDCProviders && <div>OIDC providers</div>}
            {currentTab === Tab.NetworkPolicy && <div>Network policy</div>}
          </TabPanel>
        </>
      )}
    </Flex>
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
