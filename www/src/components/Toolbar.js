import React, { useContext, useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Box } from 'grommet'

import Me from './users/Me'
import SearchRepositories from './repos/SearchRepositories'
import { CurrentUserContext } from './login/CurrentUser'
import { SIDEBAR_WIDTH, SMALL_WIDTH } from './Sidebar'
import { Breadcrumbs } from './Breadcrumbs'
import { Notifications } from './users/Notifications'
import { LoopingLogo } from './utils/AnimatedLogo'
import './toolbar.css'
import { AutoRefresh } from './login/AutoRefresh'
import { SocialLinks } from './Socials'

// const PLRL_ICON = `${process.env.PUBLIC_URL}/plural-white.png`
const PLRL_WORD = `${process.env.PUBLIC_URL}/plural-white-word.png`

function ToolbarIcon() {
  const location = useLocation()
  const [loaded, setLoaded] = useState(false)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (!loaded) {
      setLoaded(true)

      return
    }

    setAnimated(true)
    const timeout = setTimeout(() => setAnimated(false), 1500)

    return () => clearTimeout(timeout)
  }, [location])

  return (
    <LoopingLogo
      nofill
      scale="0.25"
      dark
      still={!animated}
    />
  )
}

export default function Toolbar() {
  const me = useContext(CurrentUserContext)
  const history = useHistory()

  return (
    <Box
      direction="row"
      fill="horizontal"
      align="center"
      border={{ side: 'bottom' }}
    >
      <Box
        focusIndicator={false}
        width={SIDEBAR_WIDTH}
        height="100%"
        direction="row"
        align="center"
        onClick={() => history.push('/')}
        flex={false}
        className="plrl-main-icon"
        gap="small"
      >
        <Box
          flex={false}
          width={SMALL_WIDTH}
        >
          <ToolbarIcon />
        </Box>
        <img
          src={PLRL_WORD}
          height="45px"
        />
      </Box>
      <Box
        flex={false}
        style={{ zIndex: 1 }}
      >
        <Breadcrumbs />
      </Box>
      <Box
        direction="row"
        width="100%"
        align="center"
        justify="end"
        margin={{ right: 'small' }}
      >
        <SearchRepositories />
      </Box>
      <SocialLinks />
      <Notifications />
      <AutoRefresh />
      <Box
        flex={false}
        margin={{ horizontal: 'small' }}
        round="xsmall"
      >
        <Me me={me} />
      </Box>
    </Box>
  )
}
