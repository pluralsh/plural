import React, { useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { Box, Anchor, Text } from 'grommet'
import { lookahead } from '../utils/array'

export const BreadcrumbsContext = React.createContext({
  breadcrumbs: [],
  setBreadcrumbs: () => null
})


function CrumbLink({crumb: {url, text, disable}}) {
  let history = useHistory()
  if (disable) return <Text size='small' color='dark-6'>{text}</Text>

  return (
    <Anchor size='small' onClick={() => history.push(url)}>{text}</Anchor>
  )
}

export function Breadcrumbs() {
  const {breadcrumbs} = useContext(BreadcrumbsContext)

  if (breadcrumbs.length === 0) return null

  const children = Array.from(lookahead(breadcrumbs, (crumb, next) => {
    if (next.url) {
      return [
        <CrumbLink key={crumb.url + crumb.text} crumb={crumb} />,
        <Text key={crumb.url + crumb.text + 'next'} size='small'>/</Text>
      ]
    }
    return <Text key={crumb.url + crumb.text} size='small' color='dark-6'>{crumb.text}</Text>
  })).flat()

  return (
    <Box flex={false} direction='row' gap='xsmall' align='center' pad={{horizontal: 'small'}} width='300px'>
      {children}
    </Box>
  )
}

export default function BreadcrumbProvider({children}) {
  const [breadcrumbs, setBreadcrumbs] = useState([])

  return (
    <BreadcrumbsContext.Provider value={{breadcrumbs, setBreadcrumbs}}>
      {children}
    </BreadcrumbsContext.Provider>
  )
}