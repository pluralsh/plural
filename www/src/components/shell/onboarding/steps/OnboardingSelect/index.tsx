import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Flex, Img, P } from 'honorable'
import { Button, CloudIcon } from 'pluralsh-design-system'

import { SECTION_SELECT } from '../../../constants'
import { usePersistedProvider } from '../../../usePersistance'

import OnboardingNavSection from '../../OnboardingNavSection'
import OnboardingCard from '../../OnboardingCard'

import useOnboardingNavigation from '../../useOnboardingNavigation'

import CloudOption from './CloudOption'
import ChooseAShell from './ChooseAShell'

function OnboardingSelect() {
  const [, setProvider] = usePersistedProvider()
  const [nextPath, setNextPath] = useState('')
  const [byocShell, setByocShell] = useState('cloud')
  const { previousTo, nextTo } = useOnboardingNavigation(SECTION_SELECT, nextPath, byocShell)

  function handleDemoClick() {
    setNextPath('demo')
    setProvider('GCP')
  }

  return (
    <>
      <OnboardingCard title="Choose a cloud">
        <P
          marginBottom="medium"
        >
          Plural makes it easy to plug into your own cloud, but we also provide a free demo cloud to help you get started.
        </P>
        <Flex mx={-1}>
          <CloudOption
            selected={nextPath === 'demo'}
            providerLogo={(
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
            providerLogo={(
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
            options={[
              {
                value: 'cloud',
                label: 'Our cloud shell (quickest)',
              },
              {
                value: 'cli',
                label: 'Install the Plural CLI on your local machine',
              },
            ]}
          />
        )}
      </OnboardingCard>
      <OnboardingNavSection>
        <Button
          secondary
          as={Link}
          to={previousTo}
        >
          Back
        </Button>
        <Button
          disabled={!nextPath}
          as={Link}
          to={nextTo}
        >
          Continue
        </Button>
      </OnboardingNavSection>
    </>
  )
}

export default OnboardingSelect
