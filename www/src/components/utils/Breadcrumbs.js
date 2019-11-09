import React from 'react'
import {Box, Anchor, Text} from 'grommet'
import {useHistory} from 'react-router-dom'
import {lookahead} from '../../utils/array'

function Breadcrumbs({crumbs}) {
  let history = useHistory()
  const children = Array.from(lookahead(crumbs, (crumb, next) => {
    if (next.url) {
      return [
        <Anchor key={crumb.url} size='small' onClick={() => history.push(crumb.url)}>{crumb.text}</Anchor>,
        <Text key={crumb.url + 'next'} size='small'>/</Text>
      ]
    }
    return <Text key={crumb.url} size='small'>{crumb.text}</Text>
  })).flat()

  return (
    <Box
      direction='row'
      gap='xsmall'
      pad={{horizontal: 'medium', vertical: 'small'}}
      border='bottom'>
      {children}
    </Box>
  )
}

export default Breadcrumbs