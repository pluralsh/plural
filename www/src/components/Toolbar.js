import { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box } from 'grommet'

import Me from './users/Me'
import SearchRepositories from './repos/SearchRepositories'
import { CurrentUserContext } from './login/CurrentUser'
import { SIDEBAR_WIDTH, SMALL_WIDTH } from './layout/Sidebar'
import { Breadcrumbs } from './Breadcrumbs'
import { Notifications } from './users/Notifications'
import { LoopingLogo } from './utils/AnimatedLogo'
import './toolbar.css'
import { AutoRefresh } from './login/AutoRefresh'
import { SocialLinks } from './Socials'

export const TOOLBAR_SIZE = 55

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
  }, [location, loaded])

  return (
    <LoopingLogo
      nofill
      scale="0.25"
      still={!animated}
    />
  )
}

export default function Toolbar() {
  const me = useContext(CurrentUserContext)
  const navigate = useNavigate()

  return (
    <Box
      height="55px"
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
        onClick={() => navigate('/')}
        flex={false}
        className="plrl-main-icon"
        gap="small"
      >
        <Box
          margin={{ left: '8px', right: '-8px' }}
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
