import {
  Button,
  Card,
  DiscordIcon,
  LifePreserverIcon,
} from '@pluralsh/design-system'
import { ReactElement } from 'react'
import ReactPlayer from 'react-player'
import { useIntercom } from 'react-use-intercom'
import styled from 'styled-components'

const Wrap = styled.div(({ theme }) => {
  const smallMediaQuery = `@media only screen and (min-width: ${theme.breakpoints.desktopSmall}px)`

  return {

    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.medium,
    marginTop: theme.spacing.xsmall,

    'ol, ul': {
      ...theme.partials.text.body2,
      paddingLeft: theme.spacing.large,
    },

    ol: {
      ...theme.partials.text.body2Bold,
      lineHeight: '24px',
    },

    'a.link': {
      ...theme.partials.text.inlineLink,
    },

    '.get-started': {
      display: 'flex',
      gap: theme.spacing.medium,

      '@media (max-width: 999px)': {
        flexDirection: 'column',
      },
    },

    '.video': {
      [smallMediaQuery]: {
        minWidth: 540,
        width: 640,
      },
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
        flexGrow: 1,
        alignItems: 'center',
      },
    },
  }
})

export default function ClustersHelpSection(): ReactElement {
  const { show } = useIntercom()

  return (
    <Wrap>
      <div className="get-started">
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
              width="max-content"
            >
              Get started
            </Button> {/* TODO: Link to cluster creation. */}
          </div>
        </Card>
        <div className="video">
          <ReactPlayer
            url="https://www.youtube.com/watch?v=LgwnBjYOCbg" // TODO: Update.
            width="100%"
          />
        </div>
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
                  className="link"
                  href="https://docs.plural.sh/getting-started/quickstart"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Quickstart: CLI
                </a>
              </li>
              <li>
                <a
                  className="link"
                  href="https://docs.plural.sh/getting-started/video-cli-quickstart"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Video: CLI Quickstart
                </a>
              </li>
              <li>
                <a
                  className="link"
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
              as="a"
              href="https://discord.gg/pluralsh"
              target="_blank"
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
              onClick={() => show()}
            >
              Ask us on Intercom
            </Button>
          </div>
        </div>
      </Card>
    </Wrap>
  )
}
