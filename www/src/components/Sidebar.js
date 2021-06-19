import React, { useState, useRef, useContext } from 'react'
import { Box, Text } from 'grommet'
import { useHistory, useLocation } from 'react-router-dom'
import { Tooltip } from './utils/Tooltip'
import { Aid, Group, Package, Alert, Network, List, Upgrade, User } from 'grommet-icons'
import { CurrentUserContext } from './login/CurrentUser'
import Avatar from './users/Avatar'

const SIDEBAR_ICON_HEIGHT = '45px'
const ICON_HEIGHT = '18px'
export const SIDEBAR_WIDTH = '60px'

export function SidebarIcon({icon, text, selected, path}) {
  const dropRef = useRef()
  let history = useHistory()
  const [hover, setHover] = useState(false)

  return (
    <>
    <Box
      ref={dropRef}
      focusIndicator={false}
      flex={false}
      className={'sidebar-icon' + (selected ? ' selected' : '')}
      align='center'
      justify='center'
      margin='xxsmall'
      round='xsmall'
      height={SIDEBAR_ICON_HEIGHT}
      hoverIndicator='sidebarHover'
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => history.push(path)}
      background={selected ? 'black' : null}
      direction='row'>
      {icon}
    </Box>
    {hover  && (
      <Tooltip pad={{horizontal: 'small', vertical: 'xsmall'}} round='xsmall' justify='center' 
               target={dropRef} side='right' align={{left: 'right'}}>
        <Text size='small' weight={500}>{text}</Text>
      </Tooltip>
    )}
    </>
  )
}

const OPTIONS = [
  {text: 'Explore', icon: <Package size={ICON_HEIGHT} />, path: '/explore'},
  {text: 'User', icon: <User size={ICON_HEIGHT} />, path: '/me/edit'},
  {text: 'Account', icon: <Group size={ICON_HEIGHT} />, path: '/accounts/edit/users'},
  {text: 'Upgrades', icon: <Upgrade size={ICON_HEIGHT} />, path: '/upgrades'},
  {text: 'Incidents', icon: <Alert size={ICON_HEIGHT} />, path: '/incidents'},
  {text: 'Responses', icon: <Aid size={ICON_HEIGHT} />, path: '/incidents/responses'},
  {text: 'Integrations', icon: <Network size={ICON_HEIGHT} />, path: '/webhooks'},
  {text: 'Audits', icon: <List size={ICON_HEIGHT} />, path: '/audits'},
]

export default function Sidebar() {
  const me = useContext(CurrentUserContext)
  let hist = useHistory()
  const loc = useLocation()
  const active = Math.max(OPTIONS.findIndex(({path}) => path === loc.pathname), 0)

  return (
    <Box width={SIDEBAR_WIDTH} flex={false} background='sidebar' fill='vertical'>
      <Box width={SIDEBAR_WIDTH} background='sidebar' height='100%' justify='center'>
        <Box flex={false}>
          {OPTIONS.map((opt, ind) => (
            <SidebarIcon key={opt.path} selected={ind === active} {...opt} />
          ))}
        </Box>
      </Box>
      <Box flex={false} margin={{bottom: '50px'}} align='center'>
        <Avatar user={me} round='full' onClick={() => hist.push('/me/edit/user')} size='45px' />
      </Box>
    </Box>
  )
}