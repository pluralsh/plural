import React, { useState, useRef, useContext } from 'react'
import { Box, Text } from 'grommet'
import { useHistory, useLocation } from 'react-router-dom'
import { Tooltip } from './utils/Tooltip'
import { Book, Search } from 'grommet-icons'
import { FaCreditCard, FaReceipt } from 'react-icons/fa'
import { CurrentUserContext } from './login/CurrentUser'
import Avatar from './users/Avatar'

const SIDEBAR_ROW_HEIGHT = '50px'
const ICON_HEIGHT = '20px'
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
      margin='xsmall'
      round='xsmall'
      height={SIDEBAR_ROW_HEIGHT}
      hoverIndicator='sidebarHover'
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => history.push(path)}
      background={selected ? 'black' : null}
      direction='row'>
      {icon}
    </Box>
    {hover  && (
      <Tooltip pad='small' round='xsmall' justify='center' target={dropRef} side='right' align={{left: 'right'}}>
        <Text size='small' weight={500}>{text}</Text>
      </Tooltip>
    )}
    </>
  )
}

const OPTIONS = [
  {text: 'Explore', icon: <Search size={ICON_HEIGHT} />, path: '/explore'},
  {text: 'Publishers', icon: <Book size={ICON_HEIGHT} />, path: '/publishers'},
  {text: 'Billing Details', icon: <FaCreditCard size={ICON_HEIGHT} />, path: '/me/billing'},
  {text: 'Invoices', icon: <FaReceipt size={ICON_HEIGHT} />, path: '/me/invoices'},
]

export default function Sidebar() {
  let history = useHistory()
  const me = useContext(CurrentUserContext)
  const loc = useLocation()
  const active = Math.max(OPTIONS.findIndex(({path}) => path === loc.pathname), 0)

  return (
    <Box width={SIDEBAR_WIDTH} background='sidebar' height='100%' elevation='medium' flex={false}>
      {OPTIONS.map((opt, ind) => <SidebarIcon key={opt.path} selected={ind === active} {...opt} />)}
      <Box fill='vertical' justify='end' pad='small' align='center'>
        <Box onClick={() => history.push('/me/edit')}>
          <Avatar size='40px' user={me} />
        </Box>
      </Box>
    </Box>
  )
}