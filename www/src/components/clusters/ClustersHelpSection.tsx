import {
  BrowseAppsIcon,
  Button,
  Card,
  DiscordIcon,
  LifePreserverIcon,
} from '@pluralsh/design-system'
import { ReactElement } from 'react'
import ReactPlayer from 'react-player'
import styled from 'styled-components'

const Wrap = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.medium,

  a: {
    ...theme.partials.text.inlineLink,
  },

  '.row': {
    display: 'flex',
    gap: theme.spacing.medium,
  },

  '.card': {
    ...theme.partials.text.body2,
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    padding: theme.spacing.large,
    color: theme.colors['text-light'],

    '.header': {
      ...theme.partials.text.overline,
      color: theme.colors['text-xlight'],
      marginBottom: theme.spacing.medium,
    },

    '.subheader': {
      fontWeight: 600,
      marginBottom: theme.spacing.medium,
    },

    '.resources': {
      display: 'flex',
      flexDirection: 'row',
      gap: theme.spacing.xxlarge,
    },

    '.cta': {
      display: 'flex',
      gap: theme.spacing.medium,
      flexGrow: 1,
      alignItems: 'end',
      marginBottom: theme.spacing.medium,
    },
  },
}))

export default function ClustersHelpSection(): ReactElement {
  return (
    <Wrap>
      <div className="row">
        <Card
          fillLevel={2}
          className="card"
        >
          <div className="header">Get started in 3 easy steps</div>
          <ol>
            <li>Configure your cloud and Git credentials.</li>
            <li>Install applications.</li>
            <li>Build and deploy to your cluster.</li>
          </ol>
          <p>
            After these 3 steps you will be able to manage cluster
            and access your applications from the Plural console.
          </p>
          <div className="cta">
            <Button
              secondary
              startIcon={<BrowseAppsIcon />}
            >
              Browse the marketplace
            </Button>
            <Button>Get started</Button>
          </div>
        </Card>
        <ReactPlayer url="https://www.youtube.com/watch?v=LgwnBjYOCbg" />
      </div>
      <Card
        fillLevel={2}
        className="card"
      >
        <div className="header">Helpful resources</div>
        <div className="resources">
          <div>
            <div className="subheader">Docs</div>
            <ul>
              <li>
                <a
                  href="https://docs.plural.sh/getting-started/quickstart"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Quickstart: CLI
                </a>
              </li>
              <li>
                <a
                  href="https://docs.plural.sh/getting-started/video-cli-quickstart"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Video: CLI Quickstart
                </a>
              </li>
              <li>
                <a
                  href="https://docs.plural.sh/getting-started/cloud-shell-quickstart"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Quickstart: In-Browser
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="subheader">Questions or feedback?</div>
            <Button
              floating
              small
              startIcon={<DiscordIcon />}
            >
              Join the community
            </Button>
          </div>
          <div>
            <div className="subheader">Need support?</div>
            <Button
              floating
              small
              startIcon={<LifePreserverIcon />}
            >
              Ask us on Intercom
            </Button>
          </div>
        </div>
      </Card>
    </Wrap>
  )
}
