import { memo } from 'react'
import moment from 'moment'
import { Div, Flex, P } from 'honorable'
import { Button, Chip, GitHubLogoIcon } from '@pluralsh/design-system'

import { IssueType } from './types'

type RoadmapIssuePropsType = {
  issue: IssueType
  displayAuthor?: boolean
}

const ellipsis = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

function RoadmapIssue({ issue, displayAuthor = false }: RoadmapIssuePropsType) {
  console.log('issue', issue)

  return (
    <Div
      borderBottom="1px solid border"
      padding="medium"
    >
      <Flex align="center">
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
        <P
          body2
          color="text-xlight"
          flexShrink={0}
          marginLeft="medium"
        >
          {issue.votes} vote{issue.votes > 1 ? 's' : ''}
        </P>
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
      {displayAuthor && (
        <P
          caption
          color="text-xlight"
          marginTop="small"
        >
          Requested by: {issue.author}
        </P>
      )}
    </Div>
  )
}

const toReplaces = [
  /<img .*>/g,
  /^<!--.*-->/g,
  /^#.*/g,
]

function prepareIssueBody(body: string) {
  const texts = body.split('\n')

  texts.forEach((text, i) => {
    let nextText = text

    toReplaces.forEach(toReplace => {
      nextText = nextText.replaceAll(toReplace, '')
    })

    texts[i] = nextText
  })

  const output = texts.filter(Boolean).join(' ').trim()

  return output[0].toUpperCase() + output.slice(1)
}

export default memo(RoadmapIssue)
