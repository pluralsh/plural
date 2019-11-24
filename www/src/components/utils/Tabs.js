import React, {useState, useContext} from 'react'
import {Box} from 'grommet'

const TabContext = React.createContext({})
const HOVER_BORDER = {side: 'bottom', color: 'dark-6', size: 'small'}
const ACTIVE_BORDER = {side: 'bottom', color: 'brand', size: 'small'}

export function TabHeaderItem({name, children}) {
  const {setTab, tab} = useContext(TabContext)
  const [hover, setHover] = useState(false)

  return (
    <Box
      style={{cursor: 'pointer'}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => setTab(name)}
      direction='row'
      pad='small'
      background={hover ? 'light-4' : null}
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
  const [tab, setTab] = useState(defaultTab)
  function wrappedSetTab(tab) {
    onTabChange && onTabChange(tab)
    setTab(tab)
  }

  return (
    <TabContext.Provider value={{tab, setTab: wrappedSetTab}}>
    <Box border>
      <Box
        style={{minHeight: '46px'}}
        direction='row'
        background='light-3'
        border='bottom'
        elevation='xsmall'
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