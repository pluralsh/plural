import { Flex, P } from 'honorable'
import { Button, Chip, GitHubLogoIcon } from '@pluralsh/design-system'

import { IssueType } from './types'

type RoadmapIssuePropsType = {
  issue: IssueType
}

const ellipsis = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

function RoadmapIssue({ issue }: RoadmapIssuePropsType) {
  return (
    <Flex
      align="center"
      gap="medium"
    >
      <Flex
        direction="column"
        minWidth={0}
      >
        <Flex
          align="center"
          gap="small"
          minWidth={0}
        >
          <P {...ellipsis}>
            {issue.title}
          </P>
          <P>
            {issue.createdAt}
          </P>
        </Flex>
        <P {...ellipsis}>
          {prepareIssueBody(issue.body)}
        </P>
      </Flex>
      <Chip size="large">
        In progress
      </Chip>
      <Button
        secondary
        endIcon={<GitHubLogoIcon />}
      >
        View on GitHub
      </Button>
    </Flex>
  )
}

const summaryText = '## Summary'

function prepareIssueBody(body: string) {
  const indexOfSummary = body.indexOf(summaryText)
  const text = body.slice(indexOfSummary !== -1 ? indexOfSummary + summaryText.length : 0, 21)

  return text.split('\n').join(' ')
}

export default RoadmapIssue
