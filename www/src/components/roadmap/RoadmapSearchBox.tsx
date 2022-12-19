import { useCallback, useState } from 'react'
import {
  Button,
  Flex,
  Menu,
  MenuItem,
  P,
  WithOutsideClick,
} from 'honorable'

import { SortDescIcon } from '@pluralsh/design-system'

import { IssueType } from './types'
import RoadmapIssue from './RoadmapIssue'

type SortType = 'votes' | 'recent' | 'alphabetical'

type RoadmapSearchBoxPropsType = {
  label: string
  issues: IssueType[]
}

function RoadmapSearchBox({
  label,
  issues,
}: RoadmapSearchBoxPropsType) {
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)
  const [sort, setSort] = useState<SortType>('votes')

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
      flexGrow={1}
      maxHeight="calc(100% - 89px)" // 89px is the title size
      overflow="hidden"
      paddingBottom="xlarge"
    >
      <Flex
        align="center"
        justify="space-between"
        gap="medium"
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
                <MenuItem onClick={() => handleSortSelect('votes')}>Most votes</MenuItem>
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
        <Flex
          direction="column"
          maxHeight="100%"
          overflowY="auto"
        >
          {issues.map(issue => (
            <RoadmapIssue
              key={issue.id}
              issue={issue}
            />
          ))}
        </Flex>
      </Flex>
    </Flex>
  )
}

export default RoadmapSearchBox
