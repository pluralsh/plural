import React, {useState, useContext} from 'react'
import {Box} from 'grommet'

const TabContext = React.createContext({})
const HOVER_BORDER = {side: 'bottom', color: 'dark-6', size: '2px'}
const ACTIVE_BORDER = {side: 'bottom', color: 'brand', size: '2px'}
export const BORDER_COLOR = 'light-6'

export function TabHeaderItem({name, children}) {
  const [hover, setHover] = useState(false)
  const {setTab, tab} = useContext(TabContext)

  return (
    <Box
      style={{cursor: 'pointer'}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => setTab(name)}
      direction='row'
      pad='small'
      border={tab === name ? ACTIVE_BORDER : (hover ? HOVER_BORDER : null)}>
      {children}
    </Box>
  )
}

export function TabHeader({children}) {
  return (
    <Box width='row' direction='row'>
      {children}
    </Box>
  )
}

export function TabContent({name, children}) {
  const {tab} = useContext(TabContext)
  if (name !== tab) return null

  return children
}

export default function Tabs({onTabChange, defaultTab, headerEnd, children}) {
  const [tab, setTabInner] = useState(defaultTab)
  function setTab(tab) {
    onTabChange && onTabChange(tab)
    setTabInner(tab)
  }

  return (
    <TabContext.Provider value={{tab, setTab}}>
    <Box>
      <Box
        style={{minHeight: '46px'}}
        direction='row'
        border={{side: 'bottom', color: BORDER_COLOR}}
        pad={{right: 'xsmall'}}
        align='center'>
        <Box width='100%' direction='row' gap='small'>
          {children[0]}
        </Box>
        {headerEnd}
      </Box>
      <Box>
        {children.slice(1)}
      </Box>
    </Box>
    </TabContext.Provider>
  )
}