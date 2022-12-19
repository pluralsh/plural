import { memo } from 'react'
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

const toReplaces = [
  /<img .*>/gm,
  '## Summary',
  '## Use Case',
  '<!-- Help us to understand your request in context -->',
  '<!-- A brief description of the issue and what you expect to happen instead -->',
]

function prepareIssueBody(body: string) {
  let text = body

  toReplaces.forEach(toReplace => {
    text = text.replaceAll(toReplace, '')
  })

  return text.slice(0, 100)
}

export default memo(RoadmapIssue)
