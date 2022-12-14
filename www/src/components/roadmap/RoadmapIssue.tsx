import moment from 'moment'
import { Div, Flex, P } from 'honorable'
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
      borderBottom="1px solid border"
      padding="medium"
    >
      <Flex
        direction="column"
        minWidth={0}
        gap="xxsmall"
      >
        <Flex
          align="center"
          gap="small"
          minWidth={0}
        >
          <P
            body1
            fontWeight="bold"
            {...ellipsis}
          >
            {issue.title}
          </P>
          <P
            overline
            flexShrink={0}
          >
            {moment(issue.createdAt).fromNow(true)}
          </P>
        </Flex>
        <P
          body2
          color="text-light"
          {...ellipsis}
        >
          {prepareIssueBody(issue.body) || '\u00A0'}
        </P>
      </Flex>
      <Div flexGrow={1} />
      <Chip
        size="large"
        flexShrink={0}
        marginLeft="medium"
      >
        In progress
      </Chip>
      <Button
        as="a"
        href={issue.url}
        target="_blank"
        secondary
        endIcon={<GitHubLogoIcon />}
        flexShrink={0}
        marginLeft="medium"
      >
        View on GitHub
      </Button>
    </Flex>
  )
}

const summaryText = '## Summary'
const commentText = '<!-- A brief description of the issue and what you expect to happen instead -->'
const imageRegex = /<img .*>/gm

function prepareIssueBody(body: string) {
  const indexOfSummary = body.indexOf(summaryText)
  let text = body.replaceAll(commentText, '')

  text = text.replaceAll(imageRegex, '')
  text = indexOfSummary !== -1
    ? text.slice(indexOfSummary + summaryText.length, indexOfSummary + summaryText.length + 100)
    : text.slice(0, 100)

  return text.split('\n').join(' ')
}

export default RoadmapIssue
