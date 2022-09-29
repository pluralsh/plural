import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { useSearchParams } from 'react-router-dom'
import {
  A, Accordion, Div, P,
} from 'honorable'
import { Checkbox, CloseIcon, Input } from 'pluralsh-design-system'
import Fuse from 'fuse.js'
import capitalize from 'lodash/capitalize'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { CATEGORIES_QUERY, TAGS_QUERY } from './queries'

function AccordionWithExpanded({ children, ...props }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <Accordion
      expanded={expanded}
      onExpand={() => setExpanded(!expanded)}
      {...props}
    >
      {children(expanded)}
    </Accordion>
  )
}

function MarketplaceSidebarCheckbox({
  toggled, onClick, label, trapFocus = false,
}) {
  return (
    <Checkbox
      mb={0.25}
      small
      checked={toggled}
      onChange={onClick}
      tabIndex={trapFocus ? 0 : -1}
    >
      <P
        body2
        color={toggled ? 'text' : 'text-light'}
      >
        {label}
      </P>
    </Checkbox>
  )
}

const searchOptions = {
  keys: ['tag'],
}

function MarketplaceSidebar(props) {
  const [nDisplayedTags, setNDisplayedTags] = useState(12)
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY)
  const [tags,, hasMoreTags, fetchMoreTags] = usePaginatedQuery(TAGS_QUERY,
    {},
    data => data.tags)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')

  if (!categoriesData) return null
  const filteredCategories = categoriesData.categories?.filter(c => !!c.category)

  function handleMoreTagsClick() {
    if (tags.length > nDisplayedTags) setNDisplayedTags(x => x + 12)
    else fetchMoreTags()
  }

  function handleMoreTagsKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') handleMoreTagsClick()
  }

  function handleToggle(key, value) {
    const existing = searchParams.getAll(key)
    const formatedValue = value.toLowerCase()

    if (existing.includes(formatedValue)) {
      setSearchParams({
        ...Object.fromEntries(searchParams.entries()),
        [key]: existing.filter(v => v !== formatedValue),
      })
    }
    else {
      setSearchParams({
        ...Object.fromEntries(searchParams.entries()),
        [key]: [...existing, formatedValue],
      })
    }
  }

  function isToggled(key, value) {
    return searchParams.getAll(key).includes(value.toLowerCase())
  }

  function renderCategories() {
    const sortedCategories = filteredCategories.slice().sort((a, b) => a.category.localeCompare(b.category))

    return (
      <AccordionWithExpanded
        ghost
        defaultExpanded
        title={`Categories (${sortedCategories.length})`}
        borderBottom="1px solid border !important"
      >
        {expanded => sortedCategories.map(({ category }) => (
          <MarketplaceSidebarCheckbox
            key={category}
            toggled={isToggled('category', category)}
            onClick={() => handleToggle('category', category)}
            label={capitalize(category)}
            trapFocus={expanded}
          />
        ))}
      </AccordionWithExpanded>
    )
  }

  function _renderPublishers() {
    const sortedPublishers = ['Plural']

    return (
      <AccordionWithExpanded
        ghost
        title={`Publisher (${sortedPublishers.length})`}
        borderBottom="1px solid border !important"
      >
        {expanded => sortedPublishers.map(publisher => (
          <MarketplaceSidebarCheckbox
            key={publisher}
            toggled={isToggled('publisher', publisher)}
            onClick={() => handleToggle('publisher', publisher)}
            label={capitalize(publisher)}
            trapFocus={expanded}
          />
        ))}
      </AccordionWithExpanded>
    )
  }

  function renderTags() {
    const sortedTags = tags.slice().sort((a, b) => a.tag.localeCompare(b.tag))
    const fuse = new Fuse(sortedTags, searchOptions)
    const resultTags = search ? fuse.search(search).map(({ item }) => item) : sortedTags.filter((x, i) => i < nDisplayedTags)

    return (
      <AccordionWithExpanded
        ghost
        defaultExpanded
        title={`Tags (${sortedTags.length}${((nDisplayedTags < tags.length) || hasMoreTags) ? '+' : ''})`}
      >
        {expanded => (
          <>
            <Input
              medium
              width="100%"
              placeholder="Filter"
              value={search}
              onChange={event => setSearch(event.target.value)}
              inputProps={{
                tabIndex: expanded ? 0 : -1,
              }}
              endIcon={search ? (
                <CloseIcon
                  size={8}
                  mt={0.2}
                  cursor="pointer"
                  onClick={() => setSearch('')}
                />
              ) : null}
            />
            {resultTags.map(({ tag, count }) => (
              <MarketplaceSidebarCheckbox
                key={tag}
                toggled={isToggled('tag', tag)}
                onClick={() => handleToggle('tag', tag)}
                label={`${tag} (${count})`}
                trapFocus={expanded}
              />
            ))}
            {((nDisplayedTags < tags.length) || hasMoreTags) && !search && (
              <A
                mt={0.5}
                ml="22px"
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

  return (
    <Div
      maxHeight="100%"
      overflowY="scroll"
      overflowX="hidden"
      {...props}
    >
      {renderCategories()}
      {/* TODO: Enable once more publishers are available */}
      {/* {renderPublishers()} */}
      {renderTags()}
    </Div>
  )
}
export default MarketplaceSidebar
