import { useQuery } from '@apollo/client'
import { useSearchParams } from 'react-router-dom'
import { Checkbox, Div, P } from 'honorable'

import { CATEGORIES } from '../repos/queries'

const hoverStyle = {
  '&:hover': {
    color: 'text',
    '& > span': {
      borderColor: 'primary',
    },
  },
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

function ExploreSidebarCheckbox({ toggled, onClick, label }) {
  return (
    <Div
      mt={0.5}
      xflex="x4"
      cursor="pointer"
      userSelect="none"
      color={toggled ? 'text' : 'text-light'}
      onClick={onClick}
      {...hoverStyle}
    >
      <Checkbox checked={toggled} />
      <P ml={0.5}>
        {capitalize(label)}
      </P>
    </Div>
  )
}

function ExploreSidebar() {
  const { data: categoriesData } = useQuery(CATEGORIES)
  const [searchParams, setSearchParams] = useSearchParams()

  if (!categoriesData) return null

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

  return (
    <Div
      pt={4}
      pl={4}
    >
      <P
        mb={1}
        body0
        fontWeight="bold"
      >
        Categories
      </P>
      {sortedCategories.map(({ category, count }) => (
        <ExploreSidebarCheckbox
          key={category}
          toggled={isToggled('category', category)}
          onClick={() => handleToggle('category', category)}
          label={category}
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
          label={publisher}
        />
      ))}
    </Div>
  )
}
export default ExploreSidebar
