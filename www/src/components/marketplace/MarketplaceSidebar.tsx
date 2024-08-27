import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client'
import { useSearchParams } from 'react-router-dom'
import { A, Accordion, Div } from 'honorable'
import { Card, Checkbox, CloseIcon, Input } from '@pluralsh/design-system'
import Fuse from 'fuse.js'
import capitalize from 'lodash/capitalize'

import styled from 'styled-components'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { CATEGORIES_QUERY, TAGS_QUERY } from './queries'

const SIDEBAR_WIDTH = 256 - 32

function useParamToggle(key: string) {
  const [searchParams, setSearchParams] = useSearchParams()

  const isToggled = useCallback(
    (value: string) => searchParams.getAll(key).includes(value.toLowerCase()),
    [key, searchParams]
  )
  const handleToggle = useCallback(
    (value) => {
      const existing = searchParams.getAll(key)
      const formatedValue = value.toLowerCase()

      if (existing.includes(formatedValue)) {
        setSearchParams({
          ...Object.fromEntries(searchParams.entries()),
          [key]: existing.filter((v) => v !== formatedValue),
        })
      } else {
        setSearchParams({
          ...Object.fromEntries(searchParams.entries()),
          [key]: [...existing, formatedValue],
        })
      }
    },
    [key, searchParams, setSearchParams]
  )

  return useMemo(
    () => ({
      isToggled,
      handleToggle,
    }),
    [handleToggle, isToggled]
  )
}

function AccordionWithExpanded({ children, ...props }: any) {
  const [expanded, setExpanded] = useState(true)

  return (
    <Accordion
      expanded={expanded}
      onExpand={() => setExpanded(!expanded)}
      background="transparent"
      boxShadow="none"
      {...props}
    >
      {children(expanded)}
    </Accordion>
  )
}

const CheckboxList = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing.xxsmall,
}))

const CheckboxLabel = styled.p<{ $toggled?: boolean }>(
  ({ $toggled, theme }) => ({
    ...theme.partials.text.body2,
    color: $toggled ? theme.colors.text : theme.colors['text-light'],
    margin: 0,
  })
)

function MarketplaceSidebarCheckbox({
  toggled,
  onClick,
  label,
  trapFocus = false,
}: any) {
  return (
    <Checkbox
      small
      checked={toggled}
      onChange={onClick}
      tabIndex={trapFocus ? 0 : -1}
      paddingBottom="xsmall"
      paddingTop="xsmall"
      paddingLeft="xsmall"
      paddingRight={0}
    >
      <CheckboxLabel $toggled={toggled}>{label}</CheckboxLabel>
    </Checkbox>
  )
}

const searchOptions = {
  keys: ['tag'],
}

function Categories({ categories }) {
  const { isToggled, handleToggle } = useParamToggle('category')
  const sortedCategories = useMemo(
    () => [
      { category: 'Installed' },
      { category: 'Trending' },
      ...categories
        .slice()
        .sort((a, b) => a.category.localeCompare(b.category)),
    ],
    [categories]
  )

  return (
    <AccordionWithExpanded
      ghost
      defaultExpanded
      title={`Categories (${sortedCategories.length})`}
      borderBottom="1px solid border !important"
    >
      {(expanded) => (
        <CheckboxList>
          {sortedCategories.map(({ category }) => (
            <MarketplaceSidebarCheckbox
              key={category}
              toggled={isToggled(category)}
              onClick={() => handleToggle(category)}
              label={capitalize(category)}
              trapFocus={expanded}
            />
          ))}
        </CheckboxList>
      )}
    </AccordionWithExpanded>
  )
}

function Tags({ tags, hasMore, fetchMore, search, setSearch }) {
  const [nDisplayedTags, setNDisplayedTags] = useState(12)
  const { handleToggle, isToggled } = useParamToggle('tag')
  const sortedTags = tags.slice().sort((a, b) => a.tag.localeCompare(b.tag))
  const fuse = new Fuse(sortedTags, searchOptions)
  const resultTags = search
    ? fuse.search(search).map(({ item }) => item)
    : sortedTags.filter((x, i) => i < nDisplayedTags)

  function handleMoreTagsClick() {
    if (tags.length > nDisplayedTags) setNDisplayedTags((x) => x + 12)
    else fetchMore()
  }

  function handleMoreTagsKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') handleMoreTagsClick()
  }

  return (
    <AccordionWithExpanded
      ghost
      defaultExpanded
      title={`Tags (${sortedTags.length}${
        nDisplayedTags < tags.length || hasMore ? '+' : ''
      })`}
    >
      {(expanded) => (
        <>
          <Input
            medium
            width="100%"
            placeholder="Filter"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            inputProps={{
              tabIndex: expanded ? 0 : -1,
            }}
            endIcon={
              search ? (
                <CloseIcon
                  size={10}
                  cursor="pointer"
                  onClick={() => setSearch('')}
                />
              ) : null
            }
            marginBottom="xsmall"
          />
          <CheckboxList>
            {resultTags.map(({ tag, count }) => (
              <MarketplaceSidebarCheckbox
                key={tag}
                toggled={isToggled(tag)}
                onClick={() => handleToggle(tag)}
                label={`${tag} (${count})`}
                trapFocus={expanded}
              />
            ))}
          </CheckboxList>
          {(nDisplayedTags < tags.length || hasMore) && !search && (
            <A
              mt={0.5}
              marginLeft="xsmall"
              color="text-light"
              onClick={handleMoreTagsClick}
              onKeyDown={handleMoreTagsKeyDown}
              tabIndex={expanded ? 0 : -1}
            >
              See More +
            </A>
          )}
        </>
      )}
    </AccordionWithExpanded>
  )
}

const SidebarWrapper = styled(Card)<{ $isOpen: boolean }>(
  ({ $isOpen, theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: SIDEBAR_WIDTH,
    height: 'auto',
    overflowY: 'scroll',
    overflowX: 'auto',
    marginRight: $isOpen ? theme.spacing.large : `-${SIDEBAR_WIDTH}px`,
    transform: $isOpen ? 'translateX(0)' : 'translateX(100%)',
    opacity: $isOpen ? 1 : 0,
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    right: 0,
    transition: 'all 250ms ease',
    marginBottom: theme.spacing.medium,
  })
)

function MarketplaceSidebar({ isOpen }: { isOpen: boolean }) {
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY)
  const [tags, , hasMoreTags, fetchMoreTags] = usePaginatedQuery(
    TAGS_QUERY,
    {},
    (data) => data.tags
  )
  const [search, setSearch] = useState('')

  if (!categoriesData) return null
  const filteredCategories = categoriesData.categories?.filter(
    (c) => !!c.category
  )

  return (
    <SidebarWrapper $isOpen={isOpen}>
      <Div>
        <Categories categories={filteredCategories} />
        <Tags
          tags={tags}
          hasMore={hasMoreTags}
          fetchMore={fetchMoreTags}
          search={search}
          setSearch={setSearch}
        />
      </Div>
    </SidebarWrapper>
  )
}
export default MarketplaceSidebar
