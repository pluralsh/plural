import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Box } from 'grommet'
import Sidebar from './Sidebar'
import Builds from './Builds'

const SIDEBAR_WIDTH = '100px'

export default function Watchman() {
  return (
    <Box fill direction='row' width='100vw' height='100vh'>
      <Box width={SIDEBAR_WIDTH}>
        <Sidebar />
      </Box>
      <Box flex>
        <Switch>
          <Route path='/' component={Builds} />
        </Switch>
      </Box>
    </Box>
  )
}