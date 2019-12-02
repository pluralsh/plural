import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import { Switch, Route, useHistory, useLocation } from 'react-router-dom'
import Publishers from './publisher/Publishers'
import Installations from './repos/Installations'


const OPTIONS = [
  {text: 'Publishers', path: '/publishers'},
  {text: 'Installations', path: '/installations'}
]

function SidebarOption({text, path, active}) {
  const [hover, setHover] = useState(false)
  let hist = useHistory()
  return (
    <Box
      style={{cursor: 'pointer'}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      border={active ? {size: 'medium', side: 'left', color: 'focus'} : null}
      onClick={() => hist.push(path)}
      pad='small'
      background={active ? 'sidebarActive' : (hover ? 'sidebarHover' : null)}>
      <Text size='small' style={{fontWeight: 500}}>{text}</Text>
    </Box>
  )
}

export default function Home() {
  const loc = useLocation()
  const active = Math.max(OPTIONS.findIndex(({path}) => path === loc.pathname), 0)
  return (
    <Box direction='row' height='100%'>
      <Box width='200px' background='sidebar' height='100%'>
        {OPTIONS.map((opt, ind) => <SidebarOption key={opt.path} active={ind === active} {...opt} />)}
      </Box>
      <Box width='100%' direction='row' pad='medium'>
        <Switch>
          <Route path='/installations' component={Installations} />
          <Route path={['', '/publishers']} component={Publishers} />
        </Switch>
      </Box>
    </Box>
  )
}