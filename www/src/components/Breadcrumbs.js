import { createContext, useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Anchor, Box, Text } from 'grommet'

import { lookahead } from '../utils/array'

export const BreadcrumbsContext = createContext({
  breadcrumbs: [],
  setBreadcrumbs: () => null,
})

function CrumbLink({ crumb: { url, text, disable } }) {
  const navigate = useNavigate()
  if (disable) {
    return (
      <Text
        size="small"
        color="dark-6"
      >
        {text}
      </Text>
    )
  }

  return (
    <Anchor
      size="small"
      onClick={() => navigate(url)}
    >
      {text}
    </Anchor>
  )
}

export function Breadcrumbs() {
  const { breadcrumbs } = useContext(BreadcrumbsContext)

  if (breadcrumbs.length === 0) return null

  const children = Array.from(lookahead(breadcrumbs, (crumb, next) => {
    if (next.url) {
      return [
        <CrumbLink
          key={crumb.url + crumb.text}
          crumb={crumb}
        />,
        <Text
          key={`${crumb.url + crumb.text}next`}
          size="small"
        >/
        </Text>,
      ]
    }

    return (
      <Text
        key={crumb.url + crumb.text}
        size="small"
        color="dark-6"
      >{crumb.text}
      </Text>
    )
  })).flat()

  return (
    <Box
      flex={false}
      direction="row"
      gap="xsmall"
      align="center"
      pad={{ right: 'small', left: '1px' }}
    >
      {children}
    </Box>
  )
}

export default function BreadcrumbProvider({ children }) {
  const [breadcrumbs, setBreadcrumbs] = useState([])
  const value = useMemo(() => ({ breadcrumbs, setBreadcrumbs }), [breadcrumbs])

  return (
    <BreadcrumbsContext.Provider value={value}>
      {children}
    </BreadcrumbsContext.Provider>
  )
}
