import {
  ArrowTopRightIcon,
  Button,
  CloseIcon,
  IconFrame,
  Markdown,
  SidePanelOpenIcon,
} from '@pluralsh/design-system'
import ReactPlayer from 'react-player/youtube'
import styled from 'styled-components'

import setupGuideMarkdown from './plural-cloud-setup-guide.md?raw'

const DOCS_URL =
  'https://docs.plural.sh/getting-started/first-steps/plural-cloud'
const VIDEO_URL = 'https://www.youtube.com/watch?v=sEb_gflm-ME'

export function SetupGuidePanel({ onClose }: { onClose: () => void }) {
  return (
    <PanelSC aria-label="Setup guide">
      <PanelHeaderSC>
        <Button
          small
          tertiary
          startIcon={
            <SidePanelOpenIcon css={{ transform: 'rotate(180deg)' }} />
          }
          onClick={onClose}
        >
          Setup guide
        </Button>
        <div className="actions">
          <Button
            small
            tertiary
            as="a"
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<ArrowTopRightIcon />}
          >
            Open full doc
          </Button>
          <IconFrame
            clickable
            icon={<CloseIcon />}
            onClick={onClose}
            tooltip="Close panel"
            textValue="Close panel"
          />
        </div>
      </PanelHeaderSC>
      <VideoSC>
        <ReactPlayer
          url={VIDEO_URL}
          controls
          width="100%"
          height="100%"
        />
      </VideoSC>
      <PanelBodySC>
        <Markdown text={setupGuideMarkdown} />
      </PanelBodySC>
    </PanelSC>
  )
}

const PanelSC = styled.aside(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  width: '32vw',
  minWidth: 350,
  maxWidth: 480,
  height: '100%',
  borderLeft: theme.borders.default,
  backgroundColor: theme.colors['fill-accent'],
}))

const PanelHeaderSC = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing.small,
  padding: `${theme.spacing.small} ${theme.spacing.medium}`,
  borderBottom: theme.borders.default,
  '.actions': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xsmall,
  },
}))

const PanelBodySC = styled.div(({ theme }) => ({
  ...theme.partials.text.body2,
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  padding: theme.spacing.large,
  color: theme.colors.text,
}))

const VideoSC = styled.div(({ theme }) => ({
  flexShrink: 0,
  aspectRatio: '16 / 9',
  margin: `${theme.spacing.medium} ${theme.spacing.large} 0`,
  borderRadius: theme.borderRadiuses.large,
  border: theme.borders.default,
  overflow: 'clip',
  backgroundColor: theme.colors['fill-zero'],
}))
