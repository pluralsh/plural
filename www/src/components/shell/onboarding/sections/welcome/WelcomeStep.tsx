import { Flex, Span } from 'honorable'
import { BrowseAppsIcon, Button, CloudIcon } from '@pluralsh/design-system'
import { useNavigate } from 'react-router-dom'
import { PopupModal } from 'react-calendly'
import { useContext, useState } from 'react'

import useOnboarded from '../../../hooks/useOnboarded'
import CalendarIcon from '../../assets/CalendarIcon.svg'

import { OnboardingContext } from '../../context/onboarding'

import { OnboardingPath } from '../../context/types'

import { PathOption } from './PathOption'

function WelcomeStep({ onNext }) {
  const navigate = useNavigate()
  const { fresh: isOnboarding, mutation } = useOnboarded()
  const { path, setPath } = useContext(OnboardingContext)

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
        <Span body2>How would you like to get started today?</Span>

        <Flex gap="large">
          <PathOption
            data-phid="deploy-own-app"
            selected={path === OnboardingPath.CD}
            onClick={() => setPath(OnboardingPath.CD)}
            icon={
              <CloudIcon
                size={40}
                color="text-light"
              />
            }
            header="Deploy your own applications"
            description="Use Plural Continuous Deployments to deploy applications and services from your organization."
          />
          <PathOption
            data-phid="deploy-oss-app"
            selected={path === OnboardingPath.OSS}
            onClick={() => setPath(OnboardingPath.OSS)}
            icon={
              <BrowseAppsIcon
                size={32}
                color="text-light"
              />
            }
            header="Deploy OSS applications"
            description="Explore our marketplace for open-source applications to deploy."
          />
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
            data-phid="schedule-personalized-onboarding"
            secondary
            backgroundColor="fill-two"
            startIcon={<img src={CalendarIcon} />}
            onClick={() => setCalendlyOpen(true)}
          >
            Schedule personalized onboarding
          </Button>
          <PopupModal
            url="https://calendly.com/m_plural/30min"
            rootElement={document.getElementById('root')!}
            open={calendlyOpen}
            onModalClose={() => setCalendlyOpen(false)}
          />
          <Button
            data-phid="cont-from-onboarding-overview"
            disabled={path === OnboardingPath.None}
            onClick={onNext}
          >
            Get started
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default WelcomeStep
