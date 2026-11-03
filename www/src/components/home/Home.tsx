import {
  ArrowTopRightIcon,
  Button,
  Card,
  Chip,
  ClusterIcon,
  Flex,
  type ChipProps,
} from '@pluralsh/design-system'
import moment from 'moment'
import { ReactNode, useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import ClustersContext from '../../contexts/ClustersContext'
import ConsoleInstancesContext from '../../contexts/ConsoleInstancesContext'
import { ClusterFragment, ConsoleInstanceStatus } from '../../generated/graphql'
import { hasUnfinishedCreation } from '../create-cluster/CreateCluster'
import { ContactSalesButton } from '../utils/ContactSalesButton'
import { Tone, toneMix } from '../utils/tone'

const WORDMARK_LIGHT = '/logos/plural-cloud-wordmark-black.png'
const WORDMARK_DARK = '/logos/plural-cloud-wordmark-white.png'
const MAX_ROWS = 3
const CLUSTERS_PATH = '/overview/clusters'

function clusterStatus({
  pingedAt,
}: ClusterFragment): Pick<SummaryRow, 'status' | 'severity'> {
  if (!pingedAt) return { status: 'Pending', severity: 'warning' }

  return moment().subtract(2, 'hours').isBefore(pingedAt)
    ? { status: 'Healthy', severity: 'success' }
    : { status: 'Unhealthy', severity: 'danger' }
}

export default function Home() {
  const theme = useTheme()
  const { instances } = useContext(ConsoleInstancesContext)
  const { clusters } = useContext(ClustersContext)
  const rows = useMemo<SummaryRow[]>(
    () => [
      ...instances.map(({ id, name, region, status }) => ({
        id,
        name,
        caption: region ? `Plural Cloud · ${region}` : 'Plural Cloud',
        ...(status === ConsoleInstanceStatus.Provisioned
          ? { status: 'Running', severity: 'success' as const }
          : { status: 'Provisioning', severity: 'warning' as const }),
      })),
      ...clusters.map((cluster) => ({
        id: cluster.id,
        name: cluster.name,
        caption: `Self-hosted · ${cluster.provider}`,
        ...clusterStatus(cluster),
      })),
    ],
    [clusters, instances]
  )

  return (
    <PageSC>
      <Flex
        direction="column"
        gap="large"
      >
        <Flex
          direction="column"
          gap="xsmall"
        >
          <WordmarkSC
            src={theme.mode === 'light' ? WORDMARK_LIGHT : WORDMARK_DARK}
            alt="Plural Cloud"
          />
          <SubtitleSC>
            Manage your organization and Plural products from one place.
          </SubtitleSC>
        </Flex>
        <CardsGridSC>
          {rows.length > 0 ? (
            <ProductSummary
              tone="border-primary"
              icon={<ClusterIcon size={20} />}
              product="Control planes"
              stats={[
                { label: 'Control planes', value: rows.length },
                {
                  label: 'Healthy',
                  value: rows.filter(({ severity }) => severity === 'success')
                    .length,
                },
              ]}
              rows={rows}
              openTo={CLUSTERS_PATH}
              createLabel="Create instance"
              createTo="/create-cluster"
            />
          ) : (
            <GettingStartedCard
              tone="border-primary"
              icon={<ClusterIcon size={20} />}
              product="Control planes"
              title="Create your first control plane"
              description="Deploy, upgrade and troubleshoot every Kubernetes cluster you own from one place."
              startLabel={
                hasUnfinishedCreation()
                  ? 'Resume instance creation'
                  : 'Get started'
              }
              startTo="/create-cluster"
              learnMoreHref="https://docs.plural.sh/getting-started/first-steps"
            />
          )}
        </CardsGridSC>
      </Flex>
    </PageSC>
  )
}

function GettingStartedCard({
  tone,
  icon,
  product,
  title,
  description,
  startLabel,
  startTo,
  learnMoreHref,
}: {
  tone: Tone
  icon: ReactNode
  product: string
  title: string
  description: string
  startLabel: string
  startTo: string
  learnMoreHref: string
}) {
  return (
    <GettingStartedSC $tone={tone}>
      <ProductHeader
        tone={tone}
        icon={icon}
        product={product}
      />
      <div className="copy">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <CardActionsSC>
        <Button
          as={Link}
          to={startTo}
        >
          {startLabel}
        </Button>
        <Button
          secondary
          as="a"
          href={learnMoreHref}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<ArrowTopRightIcon />}
        >
          Learn more
        </Button>
        <ContactSalesButton />
      </CardActionsSC>
    </GettingStartedSC>
  )
}

type SummaryRow = {
  id: string
  name: string
  caption: string
  status: string
  severity: ChipProps['severity']
}

function ProductSummary({
  tone,
  icon,
  product,
  stats,
  rows,
  openTo,
  createLabel,
  createTo,
}: {
  tone: Tone
  icon: ReactNode
  product: string
  stats: { label: string; value: ReactNode }[]
  rows: SummaryRow[]
  openTo: string
  createLabel: string
  createTo: string
}) {
  const hidden = rows.length - MAX_ROWS

  return (
    <SummarySC>
      <ProductHeader
        tone={tone}
        icon={icon}
        product={product}
      />
      <StatsSC>
        {stats.map(({ label, value }) => (
          <div key={label}>
            <div className="value">{value}</div>
            <div className="label">{label}</div>
          </div>
        ))}
      </StatsSC>
      <RowsSC>
        {rows.slice(0, MAX_ROWS).map((row) => (
          <div
            key={row.id}
            className="row"
          >
            <div className="name">
              <span>{row.name}</span>
              <span className="caption">{row.caption}</span>
            </div>
            <Chip
              size="small"
              severity={row.severity}
            >
              {row.status}
            </Chip>
          </div>
        ))}
        {hidden > 0 && <div className="more">+{hidden} more</div>}
      </RowsSC>
      <CardActionsSC>
        <Button
          as={Link}
          to={openTo}
        >
          Open {product.toLowerCase()}
        </Button>
        <Button
          secondary
          as={Link}
          to={createTo}
        >
          {createLabel}
        </Button>
      </CardActionsSC>
    </SummarySC>
  )
}

function ProductHeader({
  tone,
  icon,
  product,
}: {
  tone: Tone
  icon: ReactNode
  product: string
}) {
  return (
    <ProductHeaderSC $tone={tone}>
      <div className="mark">{icon}</div>
      <span>{product}</span>
    </ProductHeaderSC>
  )
}

const PageSC = styled.div(({ theme }) => ({
  padding: theme.spacing.xlarge,
  maxWidth: 1100,
  width: '100%',
  margin: '0 auto',
}))

const WordmarkSC = styled.img({
  height: 28,
  width: 'auto',
  alignSelf: 'flex-start',
})

const SubtitleSC = styled.p(({ theme }) => ({
  ...theme.partials.text.body1,
  color: theme.colors['text-light'],
  margin: 0,
}))

const CardsGridSC = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
  gap: theme.spacing.large,
}))

const ProductHeaderSC = styled.div<{ $tone: Tone }>(({ theme, $tone }) => ({
  ...theme.partials.text.body1Bold,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.small,
  color: theme.colors.text,
  '.mark': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: theme.borderRadiuses.large,
    border: `1px solid ${toneMix(theme, $tone, 40)}`,
    backgroundColor: toneMix(theme, $tone, 16),
    color: theme.colors[$tone],
  },
}))

const cardColumn = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
} as const

const GettingStartedSC = styled.div<{ $tone: Tone }>(({ theme, $tone }) => ({
  ...cardColumn,
  gap: theme.spacing.large,
  padding: theme.spacing.large,
  borderRadius: theme.borderRadiuses.large,
  border: `1px solid ${toneMix(theme, $tone, 24)}`,
  background: `linear-gradient(160deg, ${toneMix(theme, $tone, 20)} 0%, ${toneMix(theme, $tone, 5)} 55%, transparent 100%)`,
  '.copy': {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xsmall,
    flexGrow: 1,
  },
  h2: {
    ...theme.partials.text.subtitle1,
    margin: 0,
    color: theme.colors.text,
    textWrap: 'balance',
  },
  p: {
    ...theme.partials.text.body2,
    margin: 0,
    color: theme.colors['text-light'],
    textWrap: 'pretty',
  },
}))

const SummarySC = styled(Card)(({ theme }) => ({
  ...cardColumn,
  gap: theme.spacing.large,
  padding: theme.spacing.large,
}))

const StatsSC = styled.div(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing.xlarge,
  '.value': {
    ...theme.partials.text.title2,
    color: theme.colors.text,
    fontVariantNumeric: 'tabular-nums',
  },
  '.label': {
    ...theme.partials.text.caption,
    color: theme.colors['text-xlight'],
  },
}))

const RowsSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  '.row': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.small,
    padding: `${theme.spacing.small} 0`,
    borderTop: theme.borders.default,
  },
  '.name': {
    ...theme.partials.text.body2,
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing.small,
    minWidth: 0,
    color: theme.colors.text,
  },
  '.caption': {
    ...theme.partials.text.caption,
    color: theme.colors['text-xlight'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '.more': {
    ...theme.partials.text.caption,
    paddingTop: theme.spacing.small,
    borderTop: theme.borders.default,
    color: theme.colors['text-xlight'],
  },
}))

const CardActionsSC = styled.div(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing.small,
  flexWrap: 'wrap',
}))
