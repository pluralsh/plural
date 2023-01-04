import { useCallback, useMemo, useState } from 'react'
import {
  Button,
  Flex,
  Input,
  Menu,
  MenuItem,
  P,
  WithOutsideClick,
} from 'honorable'
import Fuse from 'fuse.js'

import { MagnifyingGlassIcon, SortDescIcon } from '@pluralsh/design-system'

import { IssueType } from './types'
import RoadmapIssue from './RoadmapIssue'

type SortType = 'votes' | 'recent' | 'alphabetical' | 'state'

type RoadmapSearchBoxPropsType = {
  label: string
  issues: IssueType[]
  displayAuthor?: boolean
  displayVotes?: boolean
  displayProgress?: boolean
  removeVoteSorting?: boolean
  removeStateSorting?: boolean
}

const fuseOptions = {
  threshold: 0.333,
  keys: [
    'title',
    'body',
    'author',
  ],
}

const sortStrategies = {
  votes: (a: IssueType, b: IssueType) => b.votes - a.votes,
  state: (a: IssueType, b: IssueType) => {
    if (b.state === a.state) return 0
    if (b.state === 'open') return 1
    if (a.state === 'open') return -1

    return 0
  },
  recent: (a: IssueType, b: IssueType) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf(),
  alphabetical: (a: IssueType, b: IssueType) => a.title.localeCompare(b.title),
}

function RoadmapSearchBox({
  label,
  issues,
  displayAuthor = false,
  displayVotes = false,
  displayProgress = false,
  removeVoteSorting = false,
  removeStateSorting = false,
}: RoadmapSearchBoxPropsType) {
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)
  const [sort, setSort] = useState<SortType>(removeVoteSorting ? removeStateSorting ? 'recent' : 'state' : 'votes')
  const [search, setSearch] = useState('')

  const fuse = useMemo(() => new Fuse(issues, fuseOptions), [issues])
  const displayedIssues = useMemo(() => (search ? fuse.search(search).map(x => x.item) : issues).sort(sortStrategies[sort]), [search, issues, fuse, sort])

  const handleSortClick = useCallback(() => {
    setIsSortMenuOpen(x => !x)
  }, [])

  const handleSortMenuOutsideClick = useCallback(() => {
    setIsSortMenuOpen(false)
  }, [])

  const handleSortSelect = useCallback((sort: SortType) => {
    setSort(sort)
    setIsSortMenuOpen(false)
  }, [])

  return (
    <Flex
      direction="column"
      height="calc(100% - 89px)" // 89px is the title size
      overflow="hidden"
      paddingBottom="xlarge"
    >
      <Flex
        align="center"
        justify="space-between"
        gap="medium"
        flexShrink={0}
      >
        <P
          body2
          color="text-xlight"
        >
          {label}
        </P>
        <Flex
          position="relative"
          align="center"
          justify="center"
          backgroundColor="fill-one"
          borderRadius="medium"
        >
          <Button
            secondary
            onClick={handleSortClick}
            startIcon={(<SortDescIcon />)}
          >
            Sort
          </Button>
          {isSortMenuOpen && (
            <WithOutsideClick
              preventFirstFire
              onOutsideClick={handleSortMenuOutsideClick}
            >
              <Menu
                position="absolute"
                top="calc(100% + 4px)"
                right={0}
                width={200}
                zIndex={9999}
              >
                {!removeVoteSorting && (
                  <MenuItem onClick={() => handleSortSelect('votes')}>Most votes</MenuItem>
                )}
                {!removeStateSorting && (
                  <MenuItem onClick={() => handleSortSelect('state')}>State</MenuItem>
                )}
                <MenuItem onClick={() => handleSortSelect('recent')}>Recently added</MenuItem>
                <MenuItem onClick={() => handleSortSelect('alphabetical')}>A-Z</MenuItem>
              </Menu>
            </WithOutsideClick>
          )}
        </Flex>
      </Flex>
      <Flex
        direction="column"
        maxHeight="100%"
        overflow="hidden"
        backgroundColor="fill-one"
        marginTop="medium"
      >
        <Input
          width="100%"
          startIcon={<MagnifyingGlassIcon />}
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          borderBottomLeftRadius={0}
          borderBottomRightRadius={0}
        />
        <Flex
          direction="column"
          maxHeight="100%"
          overflowY="auto"
        >
          {displayedIssues.map(issue => (
            <RoadmapIssue
              key={issue.id}
              issue={issue}
              displayAuthor={displayAuthor}
              displayVotes={displayVotes}
              displayProgress={displayProgress}
            />
          ))}
        </Flex>
      </Flex>
    </Flex>
  )
}

export default RoadmapSearchBox
