import { useContext, useState } from 'react'
import { A, Div, Flex, P } from 'honorable'
import { Button, Tab } from 'pluralsh-design-system'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import CodeLine from '../../../utils/CodeLine'

import OnboardingNavSection from '../OnboardingNavSection'

import OnboardingCard from '../OnboardingCard'

const TAB_MAC = 0
const TAB_CURL = 1
const TAB_DOCKER = 2
const TAB_EC2 = 3

function InstallCli() {
  const { previous, next } = useContext(CreateShellContext)
  const [tab, setTab] = useState(0)

  return (
    <>
      <OnboardingCard title="Install CLI">
        <Flex>
          <Tab
            active={tab === TAB_MAC}
            onClick={() => setTab(TAB_MAC)}
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
            active={tab === TAB_CURL}
            onClick={() => setTab(TAB_CURL)}
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
            active={tab === TAB_DOCKER}
            onClick={() => setTab(TAB_DOCKER)}
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
            active={tab === TAB_EC2}
            onClick={() => setTab(TAB_EC2)}
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
          {tab === TAB_MAC && 'Start by running this command in your local terminal:'}
          {tab === TAB_CURL && (
            <>
              You can download the binaries attached to our
              &nbsp;
              <A
                inline
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
          {tab === TAB_DOCKER && (
            <>
              We offer a docker image with the plural cli installed along with all cli dependencies: Terraform, Helm, Kubectl, and all the major cloud CLIs: gcr.io/pluralsh/plural-cli:0.1.1-cloud.
              We also provide a decent configuration of zsh in it, so you can drive the entire plural workflow in an interactive session.
              The best strategy is probably to mount the config dir of the cloud provider you're using, like (~/.aws), in the docker run command:
            </>
          )}
          {tab === TAB_EC2 && (
            <>
              We have EC2 AMI's with plural cli installed, along with all cloud provider clis, terraform, helm and kubectl for those interested in creating a remote environment. A registry of the AMIs can be viewed&nbsp;
              <A
                inline
                href="https://github.com/pluralsh/plural-cli/blob/master/packer/manifest.json"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </A>.
              <br />
              <br />
              If there's interest in images for GCP and Azure, please to give us a shout in our discord or feel free to open a GitHub issue.
              <br />
              <br />
              <A
                inline
                href="https://aws.amazon.com/premiumsupport/knowledge-center/launch-instance-custom-ami/"
                target="_blank"
                rel="noopener noreferrer"
              >
                This doc
              </A>
              &nbsp;gives more details on launching AMIs if you are unfamiliar. You'll want to select "Public images" within the ami search bar and you can use the ami id embedded in the artifact_id in our manifests, eg ami-0249247d5fc865089. Be sure to chose the one for the appropriate region.
            </>
          )}
        </P>
        {tab !== TAB_EC2 && (
          <>
            <CodeLine marginTop="small">
              {tab === TAB_MAC && 'brew install pluralsh/plural/plural'}
              {tab === TAB_CURL && (
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
              {tab === TAB_DOCKER && (
                <>
                  docker run -it --volume $HOME/.aws:/home/plural/aws \
                  <br />
                  {'\t'}--volume $HOME/.plural:/home/plural/.plural \
                  <br />
                  {'\t'}--volume $HOME/.ssh:/home/plural/.ssh \
                  <br />
                  {'\t'}--volume $HOME/path-to-installation-repo:/home/plural/workspace \ # optional if you want to manage git via a volume
                  <br />
                  {'\t'}gcr.io/pluralsh/plural-cli:0.1.1-cloud zsh
                </>
              )}
            </CodeLine>
            <P marginTop="small">
              {tab === TAB_MAC && (
                <>
                  The brew tap will install plural, alongside terraform, helm and kubectl for you.
                  <br />
                  If you've already installed any of those dependencies, you can add
                  <br />
                  <strong>--without-helm, --without-terraform, or --without-kubectl</strong>.
                </>
              )}
              {tab === TAB_CURL && (
                <>
                  You will still need to ensure &nbsp;
                  <A
                    inline
                    href="https://helm.sh/docs/intro/install"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Helm
                  </A>, &nbsp;
                  <A
                    inline
                    href="https://learn.hashicorp.com/tutorials/terraform/install-cli"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terraform
                  </A>
              &nbsp;and&nbsp;
                  <A
                    inline
                    href="https://kubernetes.io/docs/tasks/tools/#kubectl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Kubectl
                  </A>&nbsp;
                  are properly installed.
                </>
              )}
              {tab === TAB_DOCKER && (
                <>
                  Once you're in the container's zsh, you'll want to clone the repository you'll use for your installations state there,
                  or alternatively you can clone it outside your container and mount another volume pointing to it.
                </>
              )}
            </P>
          </>
        )}
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
