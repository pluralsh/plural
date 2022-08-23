import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { useSearchParams } from 'react-router-dom'
import {
  A, Accordion, Div, P,
} from 'honorable'
import { Checkbox, CloseIcon, Input } from 'pluralsh-design-system'
import Fuse from 'fuse.js'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'
import { capitalize } from '../../utils/string'

import { CATEGORIES_QUERY, TAGS_QUERY } from './queries'

function MarketplaceSidebarCheckbox({ toggled, onClick, label }) {
  return (
    <Checkbox
      mb={0.25}
      small
      checked={toggled}
      onChange={onClick}
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
      <Accordion
        ghost
        defaultExpanded
        title={`Categories (${sortedCategories.length})`}
        borderBottom="1px solid border !important"
      >
        {sortedCategories.map(({ category }) => (
          <MarketplaceSidebarCheckbox
            key={category}
            toggled={isToggled('category', category)}
            onClick={() => handleToggle('category', category)}
            label={capitalize(category)}
          />
        ))}
      </Accordion>
    )
  }

  function renderPublishers() {
    const sortedPublishers = ['Plural']

    return (
      <Accordion
        ghost
        title={`Publisher (${sortedPublishers.length})`}
        borderBottom="1px solid border !important"
      >
        {sortedPublishers.map(publisher => (
          <MarketplaceSidebarCheckbox
            key={publisher}
            toggled={isToggled('publisher', publisher)}
            onClick={() => handleToggle('publisher', publisher)}
            label={capitalize(publisher)}
          />
        ))}
      </Accordion>
    )
  }

  function renderTags() {
    const sortedTags = tags.slice().sort((a, b) => a.tag.localeCompare(b.tag))
    const fuse = new Fuse(sortedTags, searchOptions)
    const resultTags = search ? fuse.search(search).map(({ item }) => item) : sortedTags.filter((x, i) => i < nDisplayedTags)

    return (
      <Accordion
        ghost
        defaultExpanded
        title={`Tags (${sortedTags.length}${((nDisplayedTags < tags.length) || hasMoreTags) ? '+' : ''})`}
      >
        <Input
          medium
          width="100%"
          placeholder="Filter"
          value={search}
          onChange={event => setSearch(event.target.value)}
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
          />
        ))}
        {((nDisplayedTags < tags.length) || hasMoreTags) && !search && (
          <A
            mt={0.5}
            ml="22px"
            color="text-light"
            onClick={handleMoreTagsClick}
          >
            See More +
          </A>
        )}
      </Accordion>
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
      {renderPublishers()}
      {renderTags()}
    </Div>
  )
}
export default MarketplaceSidebar
