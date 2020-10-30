import React, { useContext, useEffect} from 'react'
import { Box } from 'grommet'
import { Switch, Route, useLocation } from 'react-router-dom'
import { ScrollableContainer } from 'forge-core'
import Publishers from './publisher/Publishers'
import Explore from './Explore'
import { BreadcrumbContext } from './Forge'
import { Search, Book } from 'grommet-icons'
import { SidebarIcon } from './Sidebar'

const ICON_HEIGHT = '20px'

const OPTIONS = [
  {text: 'Explore', icon: <Search size={ICON_HEIGHT} />, path: '/explore'},
  {text: 'Publishers', icon: <Book size={ICON_HEIGHT} />, path: '/publishers'}
]

export default function Home() {
  const loc = useLocation()
  const active = Math.max(OPTIONS.findIndex(({path}) => path === loc.pathname), 0)
  const {setBreadcrumbs} = useContext(BreadcrumbContext)
  useEffect(() => setBreadcrumbs([]), [setBreadcrumbs])

  return (
    <ScrollableContainer>
      <Box direction='row' height='100%'>
        <Box width='60px' background='sidebar' height='100%' elevation='medium' flex={false}>
          {OPTIONS.map((opt, ind) => <SidebarIcon key={opt.path} selected={ind === active} {...opt} />)}
        </Box>
        <Switch>
          <Route path='/publishers' component={Publishers} />
          <Route path={['', '/explore']} component={Explore} />
        </Switch>
      </Box>
    </ScrollableContainer>
  )
}