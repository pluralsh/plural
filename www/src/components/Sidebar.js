import React, { useContext } from 'react'
import { Box, Text } from 'grommet'
import { useHistory, useLocation } from 'react-router-dom'
import { Group, Package, Alert, Network, List, Upgrade, User, Next, Down } from 'grommet-icons'
import { CurrentUserContext } from './login/CurrentUser'
import Avatar from './users/Avatar'
import { Submenu, SubmenuContext } from './navigation/Submenu'

export const SIDEBAR_ICON_HEIGHT = '40px'
const ICON_HEIGHT = '18px'
export const SIDEBAR_WIDTH = '200px'

export function SidebarIcon({icon, text, name: sidebarName, selected, path}) {
  const {name} = useContext(SubmenuContext)
  const inSubmenu = name === sidebarName
  let history = useHistory()
  const textColor = selected && !inSubmenu ? 'white' : 'tone-medium'

  return (
    <Box flex={false} fill='horizontal' background={(selected && !inSubmenu) ? 'sidebarHover' : null} round='xsmall'>
      <Box focusIndicator={false} fill='horizontal' align='center' direction='row' 
        round='xsmall' height={SIDEBAR_ICON_HEIGHT}
        hoverIndicator='sidebarHover' onClick={!inSubmenu && selected ? null : () => history.push(path)} 
        pad={{horizontal: 'small'}}>
        <Box direction='row' align='center' gap='15px' fill='horizontal'>
          {icon}
          <Text size='small' color={textColor}>{text}</Text>
        </Box>
        {sidebarName && !selected && <Next size='12px' />}
        {sidebarName && selected  && <Down size='12px' />}
      </Box>
      {selected && <Submenu />}
    </Box>
  )
}

const OPTIONS = [
  {text: 'Explore', name: 'explore', icon: <Package size={ICON_HEIGHT} />, path: '/explore'},
  {text: 'User', icon: <User size={ICON_HEIGHT} />, path: '/me/edit'},
  {text: 'Account', icon: <Group size={ICON_HEIGHT} />, path: '/accounts/edit'},
  {text: 'Upgrades', icon: <Upgrade size={ICON_HEIGHT} />, path: '/upgrades'},
  {text: 'Incidents', name: 'incidents', icon: <Alert size={ICON_HEIGHT} />, path: '/incidents', prefix: '/incident'},
  {text: 'Integrations', icon: <Network size={ICON_HEIGHT} />, path: '/webhooks'},
  {text: 'Audits', name: 'audits', icon: <List size={ICON_HEIGHT} />, path: '/audits'},
]

export default function Sidebar() {
  const me = useContext(CurrentUserContext)
  let hist = useHistory()
  const loc = useLocation()
  const active = Math.max(OPTIONS.findIndex(({path, prefix}) => loc.pathname.startsWith(prefix || path)), 0)

  return (
    <Box width={SIDEBAR_WIDTH} flex={false} background='sidebar' fill='vertical'
         border={{side: 'right', color: 'sidebarBorder'}}>
      <Box fill='horizontal' height='100%' align='center' 
           pad={{top: 'medium', horizontal: 'small'}} gap='4px'>
        {OPTIONS.map((opt, ind) => (
          <SidebarIcon key={opt.path} selected={ind === active} {...opt} />
        ))}
      </Box>
      <Box flex={false} margin={{bottom: '30px'}} align='center'>
        <Box direction='row' gap='xsmall' align='center' hoverIndicator='sidebarHover' 
             onClick={() => hist.push('/me/edit/user')} pad='xsmall' round='xsmall'>
          <Avatar user={me} size='45px' />
          <Box>
            <Text size='small' truncate>{me.name}</Text>
            <Text size='small'>{me.email}</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}