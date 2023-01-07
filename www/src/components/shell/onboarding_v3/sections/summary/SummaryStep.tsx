import {
  Button,
  CloudIcon,
  GearTrainIcon,
  GitHubIcon,
} from '@pluralsh/design-system'
import { Div, Flex, P } from 'honorable'
import { useContext } from 'react'

import { OnboardingContext } from '../../context/onboarding'

function SummaryStep({ onBack }) {
  const { scm, workspace } = useContext(OnboardingContext)

  return (
    <Flex
      direction="column"
      gap="large"
    >
      <P
        body2
        color="text-light"
      >
        After ensuring you entered everything correctly, it's time to launch the cloud shell and install your first application!
      </P>
      <Flex
        align="center"
        borderTop="1px solid border"
        paddingTop="large"
      >
        <Flex
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
          paddingTop="large"
        >
          <Flex
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

          {workspace?.project && (
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
                {workspace?.project}
              </P>
            </Div>
          )}
        </Flex>
      )}

      <Flex
        wrap
        align="center"
        borderTop="1px solid border"
        paddingTop="large"
      >
        <Flex
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
              {workspace.clusterName}
            </P>
          </Div>
        </Flex>

        <Flex
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

      <Flex
        gap="medium"
        justify="space-between"
        borderTop="1px solid border"
        marginTop="small"
        paddingTop="large"
      >
        <Button
          secondary
          onClick={onBack}
        >Back
        </Button>
        <Button onClick={() => {}}>Create</Button>
      </Flex>
    </Flex>
  )
}

export default SummaryStep
