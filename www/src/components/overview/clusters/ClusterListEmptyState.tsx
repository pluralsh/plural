import {
  AiSparkleOutlineIcon,
  ArrowTopRightIcon,
  Button,
  ClusterIcon,
  GitPullIcon,
  useSetBreadcrumbs,
} from '@pluralsh/design-system'
import { hasUnfinishedCreation } from 'components/create-cluster/CreateCluster'
import { ContactSalesButton } from 'components/utils/ContactSalesButton'
import {
  MockCard,
  MockLine,
  PageHeader,
  ProductEmptyState,
  ProductPage,
} from 'components/utils/ProductEmptyState'
import { Tone, toneMix } from 'components/utils/tone'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import { CLUSTERS_OVERVIEW_BREADCRUMBS } from './Clusters'
import { useDeleteUnfinishedInstance } from './plural-cloud/DeleteInstance'

const TONE: Tone = 'border-primary'

export function ClusterListEmptyState() {
  useSetBreadcrumbs(CLUSTERS_OVERVIEW_BREADCRUMBS)
  const [showUnfinished, setShowUnfinished] = useState(hasUnfinishedCreation())
  const { triggerDelete, loading } = useDeleteUnfinishedInstance({
    onClear: () => setShowUnfinished(false),
  })

  return (
    <ProductPage>
      <PageHeader title="Control planes" />
      <ProductEmptyState
        tone={TONE}
        illustration={<ControlPlaneIllustration />}
        title="Create your first control plane"
        description="Your control plane runs the Plural Console. Use it to deploy, upgrade and troubleshoot every Kubernetes cluster you own from one place."
        actions={
          <>
            <Button
              as={Link}
              to="/create-cluster"
            >
              {showUnfinished ? 'Resume instance creation' : 'Get started'}
            </Button>
            {showUnfinished ? (
              <Button
                destructive
                loading={loading}
                onClick={triggerDelete}
              >
                Cancel instance creation
              </Button>
            ) : (
              <Button
                secondary
                as="a"
                href="https://docs.plural.sh/getting-started/first-steps"
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<ArrowTopRightIcon />}
              >
                Learn more
              </Button>
            )}
            <ContactSalesButton />
          </>
        }
        features={[
          {
            icon: <ClusterIcon size={16} />,
            title: 'Fleet management',
            description:
              'See every cluster across clouds, upgrade Kubernetes safely and keep add-ons in sync.',
          },
          {
            icon: <GitPullIcon size={16} />,
            title: 'Continuous deployment',
            description:
              'GitOps for services and infrastructure, with pull request automation built in.',
          },
          {
            icon: <AiSparkleOutlineIcon size={16} />,
            title: 'Plural AI',
            description:
              'Find the root cause of failing deployments and get a suggested fix as a pull request.',
          },
        ]}
      />
    </ProductPage>
  )
}

function ControlPlaneIllustration() {
  const theme = useTheme()

  return (
    <>
      <MockCard
        tone={TONE}
        title="Services"
        faded
      >
        {['85%', '60%', '75%', '50%'].map((width, i) => (
          <MockLine
            key={i}
            $width={width}
          />
        ))}
      </MockCard>
      <MockCard
        tone={TONE}
        title="Control plane"
        status="Running"
      >
        {['prod-us-east-1', 'staging', 'dev-eu-west-1'].map((name, i) => (
          <ClusterRowSC key={name}>
            <span
              className="dot"
              css={{
                backgroundColor:
                  i === 0 ? theme.colors[TONE] : toneMix(theme, TONE, 45),
              }}
            />
            <span className="name">{name}</span>
            <MockLine $width="28px" />
          </ClusterRowSC>
        ))}
      </MockCard>
      <MockCard
        tone={TONE}
        title="Pull requests"
        faded
      >
        {['70%', '90%', '55%', '80%'].map((width, i) => (
          <MockLine
            key={i}
            $width={width}
            $tone={i === 1 ? TONE : undefined}
          />
        ))}
      </MockCard>
    </>
  )
}

const ClusterRowSC = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.xsmall,
  '.dot': { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  '.name': {
    ...theme.partials.text.caption,
    flex: 1,
    fontFamily: theme.fontFamilies.mono,
    fontSize: 11,
    color: theme.colors['text-light'],
  },
}))
