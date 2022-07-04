import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Box, Text } from 'grommet'
import { useNavigate } from 'react-router-dom'
import { Portal } from 'react-portal'

export const SubmenuContext = createContext({})

export function SubmenuPortal({ children, name }) {
  const { ref, setName } = useContext(SubmenuContext)
  useEffect(() => setName(name), [name, setName])

  return (
    <Portal node={ref}>
      <Box pad={{ vertical: 'xsmall' }}>
        {children}
      </Box>
    </Portal>
  )
}

export function Submenu() {
  const { setRef } = useContext(SubmenuContext)

  return (
    <Box
      ref={setRef}
      flex={false}
    />
  )
}

const ignore = e => {
  e.preventDefault(); e.stopPropagation()
}

export function SubmenuItem({ icon, label, selected, url }) {
  const navigate = useNavigate()

  return (
    <Box
      background={selected ? 'sidebarHover' : null}
      focusIndicator={false}
      hoverIndicator="sidebarHover"
      direction="row"
      align="center"
      gap="small"
      pad={{ right: 'small', vertical: '7px', left: '20px' }}
      onClick={e => {
        ignore(e); navigate(url)
      }}
    >
      {icon}
      <Box fill="horizontal">
        <Text size="small">{label}</Text>
      </Box>
    </Box>
  )
}

export function NavigationContext({ children }) {
  const [ref, setRef] = useState(null)
  const [name, setName] = useState('')
  const value = useMemo(() => ({ ref, setRef, name, setName }), [ref, setRef, name, setName])

  return (
    <SubmenuContext.Provider value={value}>
      {children}
    </SubmenuContext.Provider>
  )
}
