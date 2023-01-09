import { Div, Flex, P } from 'honorable'
import {
  Button,
  CloudIcon,
  GearTrainIcon,
  GitHubIcon,
} from '@pluralsh/design-system'
import { useCallback, useContext } from 'react'
import styled from 'styled-components'

import { OnboardingContext } from '../../context/onboarding'
import { ScmProvider } from '../../../../../generated/graphql'

const entryGridStyle = theme => ({
  borderTop: theme.borders.default,
  display: 'flex',

  '.grid': {
    width: '100%',
    paddingTop: theme.spacing.large,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gridAutoRows: 'minmax(auto, 40px)',
    gap: theme.spacing.large,
  },

  '.entryContainer': {
    display: 'flex',
    alignItems: 'center',

    '.entry': {
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: theme.spacing.xlarge,
    },
  },

  '.scrollable': {
    paddingRight: '8px',
  },
})

const RepositorySummary = styled(RepositorySummaryUnstyled)(({ theme }) => entryGridStyle(theme))
const CloudSummary = styled(CloudSummaryUnstyled)(({ theme }) => entryGridStyle(theme))
const WorkspaceSummary = styled(WorkspaceSummaryUnstyled)(({ theme }) => entryGridStyle(theme))
const SCMProviderDisplayName = {
  [ScmProvider.Github]: 'GitHub',
  [ScmProvider.Gitlab]: 'GitLab',
}

function RepositorySummaryUnstyled({ ...props }) {
  const { scm } = useContext(OnboardingContext)

  return (
    <div {...props}>
      <GitHubIcon
        paddingTop="xlarge"
        alignSelf="start"
        size={24}
        color="text-light"
        paddingHorizontal="xsmall"
      />
      <div className="grid">
        <div className="entryContainer">
          <div className="entry">
            <P
              caption
              color="text-xlight"
            >Provider
            </P>
            <P body1>{SCMProviderDisplayName[scm?.provider]}</P>
          </div>
        </div>

        <div className="entryContainer">
          <div className="entry">
            <P
              caption
              color="text-xlight"
            >Repository Name
            </P>
            <P body1>{scm?.repositoryName}</P>
          </div>
        </div>

        <div className="entryContainer">
          <div className="entry">
            <P
              caption
              color="text-xlight"
            >Git Account
            </P>
            <P body1>{scm?.org?.name || 'User'}</P>
          </div>
        </div>

        <div className="entryContainer">
          <div className="entry">
            <P
              caption
              color="text-xlight"
            >Account Type
            </P>
            <P body1>{scm?.org?.orgType}</P>
          </div>
        </div>
      </div>
    </div>
  )
}

function CloudSummaryUnstyled({ ...props }) {
  const { workspace } = useContext(OnboardingContext)

  return (
    <div {...props}>
      <CloudIcon
        paddingTop="xlarge"
        alignSelf="start"
        size={24}
        color="text-light"
        paddingHorizontal="xsmall"
      />
      <div className="grid">
        <div className="entryContainer">
          <div className="entry">
            <P
              caption
              color="text-xlight"
            >Region
            </P>
            <P body1>{workspace?.region || '-'}</P>
          </div>
        </div>

        <div className="entryContainer">
          <div className="entry">
            <P
              caption
              color="text-xlight"
            >Credentials
            </P>
            <P body1>••••••••</P>
          </div>
        </div>

        <div className="entryContainer">
          <div className="entry">
            <P
              caption
              color="text-xlight"
            >Project
            </P>
            <P body1>{workspace?.project || '-'}</P>
          </div>
        </div>
      </div>
    </div>
  )
}

function WorkspaceSummaryUnstyled({ ...props }) {
  const { workspace } = useContext(OnboardingContext)

  return (
    <div {...props}>
      <GearTrainIcon
        paddingTop="xlarge"
        alignSelf="start"
        size={24}
        color="text-light"
        paddingHorizontal="xsmall"
      />
      <div className="grid">
        <div className="entryContainer">
          <div className="entry">
            <P
              caption
              color="text-xlight"
            >Cluster
            </P>
            <P body1>{workspace?.clusterName || '-'}</P>
          </div>
        </div>

        <div className="entryContainer">
          <div className="entry">
            <P
              caption
              color="text-xlight"
            >Bucket Prefix
            </P>
            <P body1>{workspace?.bucketPrefix}</P>
          </div>
        </div>

        <div className="entryContainer">
          <div className="entry">
            <P
              caption
              color="text-xlight"
            >Subdomain
            </P>
            <P body1>{workspace?.subdomain}.onplural.sh</P>
          </div>
        </div>
      </div>
    </div>
  )
}

function Summary({ onBack }) {
  const { setSection } = useContext(OnboardingContext)
  const onCreate = useCallback(() => setSection(s => ({ ...s, state: 'Creating' })), [setSection])

  return (
    <>
      <P
        body2
        color="text-light"
      >
        After ensuring you entered everything correctly, it's time to launch the cloud shell and install your first application!
      </P>
      <RepositorySummary />
      <CloudSummary />
      <WorkspaceSummary />

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
        <Button onClick={onCreate}>Create</Button>
      </Flex>
    </>
  )
}

export default Summary
