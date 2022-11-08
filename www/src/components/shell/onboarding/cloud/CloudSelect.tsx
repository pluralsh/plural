import { useContext, useState } from 'react'
import { Flex, Img, P } from 'honorable'
import { Button, CloudIcon, TerminalIcon } from 'pluralsh-design-system'

import { persistProvider } from '../../persistance'

import { OnboardingStatus } from '../../../profile/types'

import CurrentUserContext from '../../../../contexts/CurrentUserContext'
import CreateShellContext from '../../../../contexts/CreateShellContext'

import { SECTION_CLI_INSTALLATION, SECTION_CLOUD_BUILD, SECTION_CLOUD_CREDENTIALS } from '../../constants'
import OnboardingNavSection from '../OnboardingNavSection'

import OnboardingCard from '../OnboardingCard'

import { ChooseAShell, CloudOption } from './provider'

function ChooseShell() {
  const [shell, setShell] = useState<any>()
  const { previous, setSection } = useContext(CreateShellContext)

  return (
    <OnboardingCard title="Choose a shell">
      <P marginBottom="medium">
        Determine which shell you'll use to get started. The cloud shell
        comes fully equipped with the Plural CLI and all required dependencies.
      </P>
      <Flex mx={-1}>
        <CloudOption
          selected={shell === 'cloud'}
          icon={(
            <CloudIcon
              size={40}
              color="text-light"
            />
          )}
          header="Cloud shell"
          description="Plug in your cloud credentials and boot into Plural's cloud shell."
          onClick={() => setShell('cloud')}
        />
        <CloudOption
          selected={shell === 'cli'}
          icon={(
            <TerminalIcon
              size={40}
              color="text-light"
            />
          )}
          header="Local terminal"
          description="Install the Plural CLI in your local environment."
          onClick={() => setShell('cli')}
        />
      </Flex>
      <OnboardingNavSection>
        <Button
          secondary
          onClick={() => {
            previous()
          }}
        >
          Back
        </Button>
        <Button
          disabled={!shell}
          onClick={() => {
            if (shell === 'cli') {
              setSection(SECTION_CLI_INSTALLATION)
            }
            else {
              setSection(SECTION_CLOUD_CREDENTIALS)
            }
          }}
        >
          Continue
        </Button>
      </OnboardingNavSection>
    </OnboardingCard>
  )
}

export default function CloudSelect() {
  const me = useContext(CurrentUserContext)
  const canUseDemo = me?.onboarding === OnboardingStatus.NEW
  const { previous, setSection, setDemoId } = useContext(CreateShellContext)
  const [nextPath, setNextPath] = useState('')
  const [byocShell, setByocShell] = useState('cloud')

  if (!canUseDemo) return <ChooseShell />

  const handleDemoClick = () => {
    setNextPath('demo')
    persistProvider('GCP')
  }

  return (
    <OnboardingCard title="Choose a cloud">
      <P marginBottom="medium">
        Plural makes it easy to plug into your own cloud,
        but we also provide a free demo cloud to help you get started.
      </P>
      <Flex mx={-1}>
        <CloudOption
          selected={nextPath === 'demo'}
          icon={(
            <Img
              src="/gcp.png"
              alt="Google Cloud logo"
              width="100%"
            />
          )}
          header="GCP Cloud Demo"
          description="A six-hour instance of a GCP cloud to help get you started."
          onClick={handleDemoClick}
        />
        <CloudOption
          selected={nextPath === 'byoc'}
          icon={(
            <CloudIcon
              size={40}
              color="text-light"
            />
          )}
          header="Use Your Own Cloud"
          description="Plug in your cloud credentials and start building."
          onClick={() => setNextPath('byoc')}
        />
      </Flex>
      {nextPath === 'byoc' && (
        <ChooseAShell
          selected={byocShell}
          setSelected={setByocShell}
          options={[{
            value: 'cloud',
            label: 'Our cloud shell (quickest)',
          },
          {
            value: 'cli',
            label: 'Install the Plural CLI on your local machine',
          }]}
        />
      )}
      <OnboardingNavSection>
        <Button
          secondary
          onClick={() => {
            previous()
          }}
        >
          Back
        </Button>
        <Button
          disabled={!nextPath}
          onClick={() => {
            if (nextPath === 'byoc') {
              if (byocShell === 'cli') {
                setSection(SECTION_CLI_INSTALLATION)
              }
              else {
                setSection(SECTION_CLOUD_CREDENTIALS)
              }
            }
            else {
              setDemoId(true)
              setSection(SECTION_CLOUD_BUILD)
            }
          }}
        >
          Continue
        </Button>
      </OnboardingNavSection>
    </OnboardingCard>
  )
}
