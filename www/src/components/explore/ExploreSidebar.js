import { useQuery } from '@apollo/client'
import { useSearchParams } from 'react-router-dom'
import { A, Checkbox, Div, P } from 'honorable'

import { useState } from 'react'

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

function ExploreSidebarCheckbox({ toggled, onClick, label }) {
  return (
    <Checkbox
      mb={0.25}
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

function ExploreSidebar() {
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
      pt={2}
      pb={3}
      pl={2}
      maxHeight="100%"
      overflowY="auto"
    >
      <P
        mb={1}
        body0
        fontWeight="bold"
      >
        Categories
      </P>
      {sortedCategories.map(({ category }) => (
        <ExploreSidebarCheckbox
          key={category}
          toggled={isToggled('category', category)}
          onClick={() => handleToggle('category', category)}
          label={capitalize(category)}
        />
      ))}
      <P
        mt={2}
        mb={1}
        body0
        fontWeight="bold"
      >
        Publishers
      </P>
      {sortedPublishers.map(publisher => (
        <ExploreSidebarCheckbox
          key={publisher}
          toggled={isToggled('publisher', publisher)}
          onClick={() => handleToggle('publisher', publisher)}
          label={capitalize(publisher)}
        />
      ))}
      <P
        mt={2}
        mb={1}
        body0
        fontWeight="bold"
      >
        Tags
      </P>
      {sortedTags.map(({ tag, count }) => (
        <ExploreSidebarCheckbox
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
    </Div>
  )
}
export default ExploreSidebar
