import { A, Flex, Span } from 'honorable'
import { Button } from '@pluralsh/design-system'
import { useNavigate } from 'react-router-dom'
import { PopupModal } from 'react-calendly'
import { useContext, useState } from 'react'

import useOnboarded from '../../../hooks/useOnboarded'
import { OnboardingContext } from '../../context/onboarding'
import { OnboardingPath } from '../../context/types'

function OverviewStep({ onBack, onNext }) {
  const navigate = useNavigate()
  const { fresh: isOnboarding, mutation } = useOnboarded()
  const { path } = useContext(OnboardingContext)

  const [calendlyOpen, setCalendlyOpen] = useState(false)

  return (
    <Flex
      direction="column"
      gap="xlarge"
    >
      <Flex
        direction="column"
        gap="large"
      >
        {path === OnboardingPath.OSS && (
          <Span body2>
            Deploy your cluster and applications with Plural in about 30
            minutes, then access it via Plural Console.&nbsp;
            <A
              inline
              href="https://www.plural.sh/demo-login"
              target="_blank"
            >
              View a demo environment of our Console.
            </A>
          </Span>
        )}

        {path === OnboardingPath.CD && (
          <Span body2>
            Deployments are managed in the Plural Console, which we’ll deploy on
            a Management Cluster for you in your cloud environment. You can then
            navigate to the Console to start deploying your applications.
          </Span>
        )}

        <Flex
          direction="column"
          gap="xsmall"
        >
          <Span
            fontWeight="bold"
            body2
          >
            What to expect:
          </Span>

          {path === OnboardingPath.CD && (
            <>
              <Span>1. Configure your cloud and Git credentials.</Span>
              <Span>2. Configure your Management Cluster's workspace.</Span>
              <Span>
                3. Create your cloud shell to deploy your Plural Console. (25
                minute deploy wait time)
              </Span>
            </>
          )}

          {path === OnboardingPath.OSS && (
            <>
              <Span>1. Configure your cloud and Git credentials.</Span>
              <Span>2. Configure your cluster’s workspace.</Span>
              <Span>
                3. Create your cloud shell where you can install applications.
                (25 minute deploy wait time)
              </Span>
            </>
          )}
        </Flex>
      </Flex>
      <Flex
        gap="medium"
        justify={isOnboarding ? 'space-between' : 'flex-end'}
        borderTop="1px solid border"
        paddingTop="large"
      >
        {isOnboarding && (
          <Button
            data-phid="skip-onboarding"
            secondary
            onClick={() => {
              mutation()
              navigate('/overview/clusters')
            }}
          >
            Skip onboarding
          </Button>
        )}
        <Flex
          grow={isOnboarding ? 0 : 1}
          gap="medium"
          justify="space-between"
        >
          <Button
            data-phid="back-from-onboarding-overview"
            secondary
            onClick={onBack}
          >
            Back
          </Button>
          <PopupModal
            url="https://calendly.com/m_plural/30min"
            rootElement={document.getElementById('root')!}
            open={calendlyOpen}
            onModalClose={() => setCalendlyOpen(false)}
          />
          <Button
            data-phid="cont-from-onboarding-overview"
            onClick={onNext}
          >
            Continue
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default OverviewStep
