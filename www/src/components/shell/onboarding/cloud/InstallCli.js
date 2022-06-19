import { useContext, useState } from 'react'
import { A, Div, Flex, P } from 'honorable'
import { Button, Tab } from 'pluralsh-design-system'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import CodeLine from '../../../utils/CodeLine'

import OnboardingNavSection from '../OnboardingNavSection'

import OnboardingCard from '../OnboardingCard'

function InstallCli() {
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
          {tab === 0 && 'Start by running this command in your local terminal:'}
          {tab === 1 && (
            <>
              You can download the binaries attached to our&nbsp;
              <A
                // TODO - modify design-system to handle color
                color="action-link-inline"
                _visited={{ color: 'action-link-inline' }}
                _hover={{ color: 'action-link-inline' }}
                _active={{ color: 'action-link-inline' }}
                href="https://github.com/pluralsh/plural-cli/releases"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub releases
              </A>.
              <br />
              For example, you can download v0.2.57 for Darwin arm64 via:
            </>
          )}
        </P>
        <CodeLine marginTop="small">
          {tab === 0 && 'brew install pluralsh/plural/plural'}
          {tab === 1 && (
            <>
              curl -L -o plural.tgz 'https://github.com/pluralsh/plural-cli/releases/download/v0.2.57/plural-cli_0.2.57_Darwin_arm64.tar.gz'
              <br />
              tar -xvf plural.tgz
              <br />
              chmod +x plural
              <br />
              mv plural /usr/local/bin/plural
            </>
          )}
          {tab === 2 && 'brew install pluralsh/plural/plural'}
          {tab === 3 && 'brew install pluralsh/plural/plural'}
        </CodeLine>
        <P marginTop="small">
          {tab === 0 && (
            <>
              The brew tap will install plural, alongside terraform, helm and kubectl for you.
              <br />
              If you've already installed any of those dependencies, you can add
              <br />
              <strong>--without-helm, --without-terraform, or --without-kubectl</strong>.
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
          primary
          onClick={() => next()}
        >
          Continue
        </Button>
      </OnboardingNavSection>
    </>
  )
}

export default InstallCli
