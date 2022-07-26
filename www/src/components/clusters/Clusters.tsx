import {useQuery} from '@apollo/client';
import {ThemeContext} from 'grommet';
import {A, Flex, H3, P} from 'honorable';
import moment from 'moment';
import {ArrowTopRightIcon, Button, Chip, IconFrame, PageTitle, Sidecar, SidecarItem} from 'pluralsh-design-system';
import {ReactElement, useContext, useEffect, useState} from 'react';
import {appendConnection} from '../../utils/graphql';
import {providerToURL} from '../repos/misc';
import {RepoIcon} from '../repos/Repositories';
import {QUEUE, QUEUES, UPGRADE_QUEUE_SUB, UPGRADE_SUB} from './queries';

// TODO: This is only for FHD. Use responsive layout once it is merged.
const sidenavWidth = 240;
const contentWidth = 896;
const sidecarWidth = 200;
const contentGap = 32;
const sidebarGap = 32;
const gutter = 24;

export function Clusters(): ReactElement | null {
  const [queue, setQueue] = useState(null)
  const {data, subscribeToMore} = useQuery(QUEUES, {fetchPolicy: 'cache-and-network'})

  useEffect(() => subscribeToMore({
    document: UPGRADE_QUEUE_SUB,
    updateQuery: ({upgradeQueues, ...prev}, {
      subscriptionData: {
        data: {
          upgradeQueueDelta: {
            delta,
            payload
          }
        }
      }
    }) => delta === 'CREATE' ? {...prev, upgradeQueues: [payload, ...upgradeQueues]} : prev,
  }), [subscribeToMore])

  useEffect(() => data ? setQueue(data?.upgradeQueues[0]) : data, [data])

  if (!data || !queue) {
    return null
  }

  return (
    <Flex direction="row"
          grow={1}
          gap={contentGap}
          overflowY="auto"
          paddingBottom={16}>
      <SidenavLayout queue={queue}></SidenavLayout>
      <ContentLayout queue={queue}></ContentLayout>
      <SidecarLayout queue={queue}></SidecarLayout>
    </Flex>
  )
}

function SidenavLayout({queue}): ReactElement {
  return (
    <Flex maxWidth={sidenavWidth}
          grow={1}
          gap={24}
          direction="column"
          paddingLeft={sidebarGap}>
      <ProfileCard queue={queue}></ProfileCard>
      <H3>Select Placeholder</H3>
    </Flex>
  )
}

interface Queue {
  acked: string;
  domain: string;
  git: string;
  id: string;
  name: string;
  pingedAt: string;
  provider: string;
  upgrades: Upgrade[];
}

// TODO: Use autogenerated graphql types
interface Upgrade {
  id: string;
  insertedAt: string;
  message: string;
  repository: Repository;
}

interface Repository {
  id: string;
  name: string;
  category: string;
  darkIcon: string;
  icon: string;
  description: string;
}

function ProfileCard({queue}: { queue: Queue }): ReactElement {
  const {dark} = useContext(ThemeContext) as { dark }
  const url = providerToURL(queue?.provider, dark)

  return (
    <Flex paddingTop={68}>
      <IconFrame size="small" url={url}></IconFrame>
      <Flex direction="column"
            paddingLeft={12}
            justify="center">
        <P subtitle2>{queue?.name}</P>
        <P caption color="text-xlight">{queue?.provider}</P>
      </Flex>
    </Flex>
  )
}

function ContentLayout({queue}: { queue: Queue }): ReactElement | null {
  const {data, subscribeToMore, refetch} = useQuery(QUEUE, {
    variables: {id: queue.id},
    fetchPolicy: 'cache-and-network',
  })

  useEffect(() => subscribeToMore({
    document: UPGRADE_SUB,
    variables: {id: queue.id},
    updateQuery: ({upgradeQueue, ...rest}, {subscriptionData: {data: {upgrade}}}) => ({
      ...rest,
      upgradeQueue: appendConnection(upgradeQueue, upgrade, 'upgrades')
    }),
  }), [queue.id, subscribeToMore])

  if (!data) return null

  return (
    <Flex width={contentWidth}
          minWidth={contentWidth}
          grow={1}
          direction="column">
      <PageTitle heading="Upgrades"
                 paddingTop={68}
                 headingProps={{}}
                 children={<Button secondary onClick={() => refetch()}>Refresh</Button>}
      ></PageTitle>
      <UpgradesList upgrades={data.upgradeQueue?.upgrades?.edges}
                    acked={queue.acked}></UpgradesList>
    </Flex>
  )
}

function UpgradesList({upgrades, acked}): ReactElement {
  return (
    <Flex direction="column"
          backgroundColor="fill-one"
          color="text-light"
          border="1px solid border"
          borderRadius="large"
          overflowY="auto">
      {upgrades?.map(upgrade => (
        <UpgradeItem key={upgrade.node.id}
                     upgrade={upgrade.node as Upgrade}
                     acked={acked}
        ></UpgradeItem>
      ))}
      {upgrades?.map(upgrade => (
        <UpgradeItem key={upgrade.node.id}
                     upgrade={upgrade.node as Upgrade}
                     acked={acked}
        ></UpgradeItem>
      ))}
    </Flex>
  )
}

function UpgradeItem({upgrade, acked}: { upgrade: Upgrade, acked: string }): ReactElement | null {
  const delivered = acked && upgrade.id <= acked
  const severity = delivered ? 'success' : 'neutral'

  return (
    <Flex grow={1}
          borderBottom="1px solid border"
          padding={16}
          {...{
            ":last-of-type": {borderBottom: "none"}
          }}>
      <RepoIcon repo={upgrade.repository}
                size="48px"
                round=""></RepoIcon>
      <Flex direction="column"
            paddingLeft={12}
            gap={4}
            justify="center">
        <Flex body1
              direction="row"
              gap={8}>
          <P color="text">{upgrade.repository.name}</P>
          <P color="text-xlight">{moment(upgrade.insertedAt).format('lll')}</P>
        </Flex>
        <P body2
           color="text-light">{upgrade.message}</P>
      </Flex>
      <Flex grow={1}/>
      <Chip alignSelf="center" size="large"
            severity={severity}
            hue="lighter">{delivered ? 'Delivered' : 'Pending'}</Chip>
    </Flex>
  )
}

function SidecarLayout({queue}: { queue: Queue }): ReactElement {
  return (
    <Flex maxWidth={sidecarWidth}
          grow={1}
          gap={24}
          direction="column"
          paddingRight={gutter}
          paddingTop={68}>
      <Button secondary
              endIcon={<ArrowTopRightIcon size={24}/>}
              as={A}
              target="_blank"
              href={`https://${queue.domain}`}
              {...{
                '&:hover': {
                  textDecoration: "none"
                }
              }}>
        Console
      </Button>
      <Sidecar heading="Metadata">
        <SidecarItem heading="Cluster name">
          {queue.name}
        </SidecarItem>
        <SidecarItem heading="Git url">
          <A
            inline
            target="_blank"
            noreferrer
            noopener
            href={queue.git}
          >
            {queue.git}
          </A>
        </SidecarItem>
        <SidecarItem heading="Acked">
          {queue.acked}
        </SidecarItem>
        <SidecarItem heading="Last pinged">
          {moment(queue.pingedAt).format("lll")}
        </SidecarItem>
      </Sidecar>
    </Flex>
  )
}
