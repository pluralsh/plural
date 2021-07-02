import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { Box, Image } from 'grommet'
import Me from './users/Me'
import SearchRepositories from './repos/SearchRepositories'
import { CurrentUserContext } from './login/CurrentUser'
import { SIDEBAR_WIDTH } from './Sidebar'
import { Breadcrumbs } from './Breadcrumbs'
import { Notifications } from './users/Notifications'

const PLRL_ICON = `${process.env.PUBLIC_URL}/plural-white.png`

export default function Toolbar() {
  const me = useContext(CurrentUserContext)
  let history = useHistory()

  return (
    <Box direction='row' fill='horizontal' align='center'>
      <Box focusIndicator={false} width={SIDEBAR_WIDTH} height='100%' justify='center' align='center'
           onClick={() => history.push('/')} flex={false}>
        <Image src={PLRL_ICON} height='30px' />
      </Box>
      <Breadcrumbs />
      <Box direction='row' width='100%' align='center' justify='end' margin={{right: 'small'}}>
        <SearchRepositories />
      </Box>
      <Notifications />
      <Box flex={false} margin='small' round='xsmall'>
        <Me me={me} />
      </Box>
    </Box>
  )
}