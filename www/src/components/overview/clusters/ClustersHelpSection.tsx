import {
  Button,
  Card,
  DocumentIcon,
  Flex,
  LifePreserverIcon,
  SendMessageIcon,
} from '@pluralsh/design-system'
import { ReactElement } from 'react'
import { useIntercom } from 'react-use-intercom'
import styled from 'styled-components'

export function ClustersHelpSection(): ReactElement {
  const { show } = useIntercom()

  return (
    <ResourcesCard>
      <div className="header">Helpful resources</div>
      <Flex gap="medium">
        <ResourcesButton
          secondary
          startIcon={<DocumentIcon />}
          forwardedAs="a"
          href="https://docs.plural.sh/getting-started/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Documentation
        </ResourcesButton>
        <ResourcesButton
          secondary
          startIcon={<SendMessageIcon />}
          forwardedAs="a"
          href="https://www.plural.sh/contact"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact sales
        </ResourcesButton>
        <ResourcesButton
          secondary
          startIcon={<LifePreserverIcon />}
          onClick={() => show()}
        >
          Chat on Intercom
        </ResourcesButton>
      </Flex>
    </ResourcesCard>
  )
}

const ResourcesCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.large,
  padding: theme.spacing.xlarge,
  minWidth: 'max-content',
  background: theme.colors['fill-accent'],
  '.header': {
    ...theme.partials.text.overline,
    color: theme.colors['text-xlight'],
  },
}))

const ResourcesButton = styled(Button)({
  flex: 1,
  minWidth: 'fit-content',
})
