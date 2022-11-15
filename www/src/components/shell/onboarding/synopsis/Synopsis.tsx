import { useContext } from 'react'
import { Div, Flex, P } from 'honorable'
import {
  Button,
  CloudIcon,
  GearTrainIcon,
  GitHubIcon,
} from '@pluralsh/design-system'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import { SECTION_CLOUD_LAUNCH } from '../../constants'

import OnboardingNavSection from '../OnboardingNavSection'
import OnboardingCard from '../OnboardingCard'

function Synopsis() {
  const {
    scm, workspace, previous, next, demoId, setSection, ..._rest
  } = useContext(CreateShellContext)

  return (
    <OnboardingCard
      title="Review details"
    >
      <P
        body2
        color="text-light"
      >
        After ensuring you entered everything correctly, it's time to launch the cloud shell and install your first application!
      </P>
      <Flex
        align="center"
        marginTop="medium"
        borderTop="1px solid border"
        paddingVertical="xlarge"
        paddingHorizontal="xlarge"
        marginHorizontal={-32}
      >
        <Flex
          flexShrink={0}
          align="center"
          width="50%"
        >
          <GitHubIcon
            size={24}
            color="text-light"
            paddingHorizontal="small"
          />
          <Div marginLeft="large">
            <P
              caption
              color="text-xlight"
            >
              Repository name
            </P>
            <P body1>
              {scm.name}
            </P>
          </Div>
        </Flex>
        <Flex
          flexGrow={1}
          flexShrink={0}
          align="center"
          marginLeft="xlarge"
        >
          <Div>
            <P
              caption
              color="text-xlight"
            >
              Git account
            </P>
            <P body1>
              {scm.org || 'User'}
            </P>
          </Div>
        </Flex>
      </Flex>
      {!!workspace.region && (
        <Flex
          wrap
          align="center"
          borderTop="1px solid border"
          paddingVertical="xlarge"
          paddingHorizontal="xlarge"
          marginHorizontal={-32}
        >
          <Flex
            flexShrink={0}
            align="center"
            width="50%"
          >
            <CloudIcon
              size={24}
              color="text-light"
              paddingHorizontal="small"
            />
            <Div marginLeft="large">
              <P
                caption
                color="text-xlight"
              >
                Region
              </P>
              <P body1>
                {workspace.region}
              </P>
            </Div>
          </Flex>
          <Flex
            flexGrow={1}
            flexShrink={0}
            align="center"
            marginLeft="xlarge"
          >
            <Div>
              <P
                caption
                color="text-xlight"
              >
                Credentials
              </P>
              <P body1>
                ••••••••
              </P>
            </Div>
          </Flex>
          <Div
            marginTop="medium"
            width="100%"
            marginLeft="large"
            paddingLeft="xxlarge"
          >
            <P
              caption
              color="text-xlight"
            >
              Project
            </P>
            <P body1>
              xxx
            </P>
          </Div>
        </Flex>
      )}
      <Flex
        wrap
        align="center"
        borderTop="1px solid border"
        paddingTop="xlarge"
        paddingHorizontal="xlarge"
        marginHorizontal={-32}
      >
        <Flex
          flexShrink={0}
          align="center"
          width="50%"
        >
          <GearTrainIcon
            size={24}
            color="text-light"
            paddingHorizontal="small"
          />
          <Div marginLeft="large">
            <P
              caption
              color="text-xlight"
            >
              Cluster
            </P>
            <P body1>
              {workspace.cluster}
            </P>
          </Div>
        </Flex>
        <Flex
          flexGrow={1}
          flexShrink={0}
          align="center"
          marginLeft="xlarge"
        >
          <Div>
            <P
              caption
              color="text-xlight"
            >
              Bucket prefix
            </P>
            <P body1>
              {workspace.bucketPrefix}
            </P>
          </Div>
        </Flex>
        <Div
          marginTop="medium"
          width="100%"
          marginLeft="large"
          paddingLeft="xxlarge"
        >
          <P
            caption
            color="text-xlight"
          >
            Subdomain
          </P>
          <P body1>
            {workspace.subdomain}.onplural.sh
          </P>
        </Div>
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
          primary
          onClick={() => {
            if (demoId) setSection(SECTION_CLOUD_LAUNCH)
            else next()
          }}
        >
          Continue
        </Button>
      </OnboardingNavSection>
    </OnboardingCard>
  )
}

export default Synopsis
