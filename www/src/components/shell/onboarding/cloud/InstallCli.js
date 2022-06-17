import { useContext, useState } from 'react'
import { Div, Flex, P } from 'honorable'
import { ArrowTopRightIcon, Button, Tab } from 'pluralsh-design-system'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import CodeLine from '../../../utils/CodeLine'

import OnboardingNavSection from '../OnboardingNavSection'

import OnboardingCard from '../OnboardingCard'

export default function InstallCli() {
  const { previous, next } = useContext(CreateShellContext)
  const [tab, setTab] = useState(0)

  return (
    <>
      <OnboardingCard title="Install CLI">
        <Flex>
          <Tab
            active={tab === 0}
            onClick={() => setTab(0)}
            flexGrow={1}
          >
            <Div
              flexGrow={1}
              textAlign="center"
            >
              Mac
            </Div>
          </Tab>
          <Tab
            active={tab === 1}
            onClick={() => setTab(1)}
            flexGrow={1}
          >
            <Div
              flexGrow={1}
              textAlign="center"
            >
              Curl
            </Div>
          </Tab>
          <Tab
            active={tab === 2}
            onClick={() => setTab(2)}
            flexGrow={1}
          >
            <Div
              flexGrow={1}
              textAlign="center"
            >
              Docker
            </Div>
          </Tab>
          <Tab
            active={tab === 3}
            onClick={() => setTab(3)}
            flexGrow={1}
          >
            <Div
              flexGrow={1}
              textAlign="center"
            >
              EC2 AMI
            </Div>
          </Tab>
        </Flex>
        <P marginTop="small">
          Start by running this command in your local terminal:
        </P>
        <CodeLine marginTop="small">
          {tab === 0 && 'brew install pluralsh/plural/plural'}
          {tab === 1 && 'brew install pluralsh/plural/plural'}
          {tab === 2 && 'brew install pluralsh/plural/plural'}
          {tab === 3 && 'brew install pluralsh/plural/plural'}
        </CodeLine>
        <P marginTop="small">
          {tab === 0 && (
            <>
              The brew tap will install plural, alongside terraform, helm and kubectl for you.
              If you've already installed any of those dependencies,
              you can add <br /><strong>--without-helm, --without-terraform, or --without-kubectl</strong>.
            </>
          )}
        </P>
      </OnboardingCard>
      <OnboardingNavSection>
        <Button
          secondary
          onClick={() => previous()}
        >
          Back
        </Button>
        <Button
          secondary
          onClick={() => next()}
        >
          Continue
        </Button>
      </OnboardingNavSection>
    </>
  )
}
