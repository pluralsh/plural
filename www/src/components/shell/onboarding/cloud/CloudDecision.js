import { useContext, useState } from 'react'
import { Flex, Img, P } from 'honorable'
import { Button, CloudIcon } from 'pluralsh-design-system'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import { SECTION_INSTALL_CLI } from '../../constants'
import OnboardingNavSection from '../OnboardingNavSection'

import OnboardingCard from '../OnboardingCard'

import { ChooseAShell, CloudOption } from './provider'

export function CloudDecision({ doSetPath }) {
  const { previous, setSection } = useContext(CreateShellContext)

  const [nextPath, setNextPath] = useState()
  const [byocShell, setByocShell] = useState('cloud')

  return (
    <>
      <OnboardingCard title="Choose a cloud">
        <P
          body1
          color="text-light"
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
            onClick={() => setNextPath('demo')}
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
      </OnboardingCard>
      {/* Navigation */}
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
            if (nextPath === 'byoc' && byocShell === 'cli') {
              setSection(SECTION_INSTALL_CLI)
            }
            else {
              doSetPath(nextPath)
            }
          }}
        >Continue
        </Button>
      </OnboardingNavSection>
    </>
  )
}
