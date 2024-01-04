import {
  CloudIcon,
  InfoOutlineIcon,
  PricingCalculator,
  Radio,
  RadioGroup,
  Tooltip,
} from '@pluralsh/design-system'
import { Flex, Span } from 'honorable'
import { useContext, useEffect, useMemo, useState } from 'react'

import { ImpersonationContext } from '../../../context/impersonation'

import GCPLogoIcon from '../../assets/GCPLogoIcon.svg'

import { OnboardingContext } from '../../context/onboarding'
import { CloudType, OnboardingPath } from '../../context/types'

import { CloudOption } from './CloudOption'
import { useTheme } from 'styled-components'

function ProviderSelection() {
  const theme = useTheme()
  const {
    cloud,
    setCloud,
    setValid,
    path: onboardingPath,
  } = useContext(OnboardingContext)
  const {
    user: { demoed },
  } = useContext(ImpersonationContext)
  const [path, setPath] = useState(
    onboardingPath === OnboardingPath.CD ? CloudType.Cloud : cloud?.type
  )
  const isValid = useMemo(() => path !== undefined, [path])

  useEffect(() => setCloud((c) => ({ ...c, type: path })), [path, setCloud])
  useEffect(() => setValid(isValid), [setValid, isValid])

  return (
    <Flex
      direction="column"
      gap="xlarge"
    >
      <div
        css={{
          display: 'flex',
          gap: theme.spacing.xlarge,
          alignItems: 'stretch',
        }}
      >
        <CloudOption
          data-phid="select-cloud-shell"
          selected={path === CloudType.Cloud || path === CloudType.Local}
          onClick={() =>
            (!path || path === CloudType.Demo) && setPath(CloudType.Cloud)
          }
          icon={
            <CloudIcon
              size={40}
              color={theme.colors['text-light']}
            />
          }
          header="Use your own cloud"
          description="Connect your own cloud credentials and spin up your own cluster."
        />
        {onboardingPath === OnboardingPath.OSS && (
          <CloudOption
            data-phid="select-cloud-demo"
            selected={path === CloudType.Demo}
            onClick={() => setPath(CloudType.Demo)}
            disabled={demoed}
            tooltip={
              demoed
                ? 'You have reached the maximum number of demo environment usage.'
                : undefined
            }
            icon={
              <img
                src={GCPLogoIcon}
                width={40}
              />
            }
            header="Try free demo"
            description="A six-hour GCP sandbox for you to test-drive Plural."
          />
        )}
      </div>
      {onboardingPath === OnboardingPath.OSS && <PricingCalculator />}
      {(path === CloudType.Cloud || path === CloudType.Local) && (
        <RadioGroup
          value={path.toString()}
          onChange={(e) => {
            setPath(Number(e))
          }}
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.xxsmall,
          }}
        >
          <Radio value={CloudType.Cloud.toString()}>
            <Flex gap="small">
              <Span>Use our cloud shell (quick and easy)</Span>
              <Tooltip label="We host a free cloud environment for you to use our CLI and run commands as if it was on your own computer.">
                <InfoOutlineIcon color="icon-light" />
              </Tooltip>
            </Flex>
          </Radio>
          <Radio value={CloudType.Local.toString()}>
            <Flex gap="small">
              <Span>Install the CLI on your local machine (most secure)</Span>
              <Tooltip label="If you'd rather not upload your cloud credentials, you can set up your applications locally w/ our cli in a maximally secure setup">
                <InfoOutlineIcon color="icon-light" />
              </Tooltip>
            </Flex>
          </Radio>
        </RadioGroup>
      )}
    </Flex>
  )
}

export { ProviderSelection }
