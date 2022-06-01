import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { useSearchParams } from 'react-router-dom'
import { A, Accordion, Div, P } from 'honorable'
import { Checkbox } from 'pluralsh-design-system'

import { CATEGORIES, REPO_TAGS } from '../repos/queries'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'
import { capitalize } from '../../utils/string'

const hoverStyle = {
  '&:hover': {
    color: 'text',
    '& > span': {
      borderColor: 'primary',
    },
  },
}

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

function MarketplaceSidebar(props) {
  const [nDisplayedTags, setNDisplayedTags] = useState(12)
  const { data: categoriesData } = useQuery(CATEGORIES)
  const [tags,, hasMoreTags, fetchMoreTags] = usePaginatedQuery(
    REPO_TAGS,
    {
      variables: {
        q: '',
      },
    },
    data => data.tags
  )
  const [searchParams, setSearchParams] = useSearchParams()

  if (!categoriesData) return null

  function handleMoreTagsClick() {
    if (tags.length > nDisplayedTags) setNDisplayedTags(x => x + 12)
    else fetchMoreTags()
  }

  function handleToggle(key, value) {
    const existing = searchParams.getAll(key)

    if (existing.includes(value)) {
      setSearchParams({
        ...searchParams,
        [key]: existing.filter(v => v !== value),
      })
    }
    else {
      setSearchParams({
        ...searchParams,
        [key]: [...existing, value],
      })
    }
  }

  function isToggled(key, value) {
    return searchParams.getAll(key).includes(value)
  }

  const sortedCategories = categoriesData.categories.slice().sort((a, b) => a.category.localeCompare(b.category))
  const sortedPublishers = ['Plural']
  const sortedTags = tags.slice().sort((a, b) => a.tag.localeCompare(b.tag)).filter((x, i) => i < nDisplayedTags)

  return (
    <Div
      maxHeight="100%"
      overflowY="auto"
      {...props}
    >
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
      <Accordion
        ghost
        defaultExpanded
        title={`Tags (${sortedTags.length}${((nDisplayedTags < tags.length) || hasMoreTags) ? '+' : ''})`}
      >
        {sortedTags.map(({ tag, count }) => (
          <MarketplaceSidebarCheckbox
            key={tag}
            toggled={isToggled('tag', tag)}
            onClick={() => handleToggle('tag', tag)}
            label={`${tag} (${count})`}
          />
        ))}
        {((nDisplayedTags < tags.length) || hasMoreTags) && (
          <A
            mt={0.5}
            ml="22px"
            color="text-light"
            onClick={handleMoreTagsClick}
            {...hoverStyle}
          >
            See More +
          </A>
        )}
      </Accordion>
    </Div>
  )
}
export default MarketplaceSidebar
