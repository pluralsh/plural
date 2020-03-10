import React, {useState, useContext, useEffect} from 'react'
import {Box, Text} from 'grommet'
import { Switch, Route, useHistory, useLocation } from 'react-router-dom'
import Publishers from './publisher/Publishers'
import Explore from './Explore'
import ScrollableContainer from './utils/ScrollableContainer'
import { BreadcrumbContext } from './Forge'


const OPTIONS = [
  {text: 'Explore', path: '/explore'},
  {text: 'Publishers', path: '/publishers'}
]

function SidebarOption({text, path, active}) {
  const [hover, setHover] = useState(false)
  let hist = useHistory()
  return (
    <Box
      style={{cursor: 'pointer'}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      border={active ? {size: '3px', side: 'left', color: 'focus'} : null}
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
  const {setBreadcrumbs} = useContext(BreadcrumbContext)
  useEffect(() => setBreadcrumbs([]), [setBreadcrumbs])

  return (
    <ScrollableContainer>
      <Box direction='row' height='100%'>
        <Box width='200px' background='sidebar' height='100%'>
          {OPTIONS.map((opt, ind) => <SidebarOption key={opt.path} active={ind === active} {...opt} />)}
        </Box>
        <Switch>
          <Route path='/publishers' component={Publishers} />
          <Route path={['', '/explore']} component={Explore} />
        </Switch>
      </Box>
    </ScrollableContainer>
  )
}