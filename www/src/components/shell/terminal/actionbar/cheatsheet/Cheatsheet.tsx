import { Layer } from 'grommet'
import { Card, CloseIcon, IconFrame } from '@pluralsh/design-system'
import { Div, Flex, Span } from 'honorable'

import { CheatsheetCommand } from './CheatsheetCommand'

function Cheatsheet({ onClose }) {
  return (
    <Layer
      plain
      animation="fadeIn"
      position="bottom-right"
      modal={false}
      margin={{ bottom: '56x' }}
    >
      <Card
        fillLevel={2}
        width={420}
        overflow="hidden"
        margin="large"
        display="flex"
        flexDirection="column"
      >
        <Flex
          direction="column"
          gap="xsmall"
          padding="large"
          borderBottom="1px solid border-fill-two"
        >
          <Flex justify="space-between">
            <Span
              body0
              fontWeight={500}
              lineHeight="24px"
            >
              CLI cheat sheet
            </Span>
            <IconFrame
              clickable
              onClick={onClose}
              icon={<CloseIcon />}
            />
          </Flex>
          <Div
            body2
            color="text-light"
          >
            Select a command below to copy
          </Div>
        </Flex>
        <CheatsheetCommands />
      </Card>
    </Layer>
  )
}

function CheatsheetCommands() {
  const commands = [
    {
      command: 'repos list',
      description:
        'Shows all available applications on the platform (repos) and the cloud providers they can be deployed to (using a bundle).',
    },
    {
      command: 'bundle list <repo>',
      description: 'Shows all available bundles for repository.',
    },
    {
      command: 'bundle install <repo> <bundle>',
      description: (
        <>
          E.g. <strong>plural bundle install dagster dagster-gcp</strong> would
          configure Dagster for deployment to GCP.
        </>
      ),
    },
    {
      command: 'build',
      description: 'Generates all the infrastructure as code.',
    },
    {
      command: 'deploy',
      description: 'Deploys all installed bundles.',
    },
    {
      command: 'watch <repo>',
      description: 'Watches applications until they become ready.',
    },
  ]

  return (
    <Flex
      overflow="auto"
      direction="column"
    >
      {commands.map((c, idx) => (
        <CheatsheetCommand
          key={c.command}
          command={c.command}
          description={c.description}
          last={commands.length - 1 === idx}
        />
      ))}
    </Flex>
  )
}

export { Cheatsheet }
