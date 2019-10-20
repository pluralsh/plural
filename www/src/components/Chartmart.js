import React from 'react'
import {Box, Grid} from 'grommet'
import { Switch, Route } from 'react-router-dom'
import CurrentUser from './login/CurrentUser'
import Publishers from './publisher/Publishers'

const TOOLBAR_SIZE = '50px'

function Chartmart(props) {
  return (
    <CurrentUser>
    {me => (
      <Grid
        fill
        rows={[TOOLBAR_SIZE, 'flex']}
        columns={[TOOLBAR_SIZE, 'flex']}
        areas={[
          {name: 'toolbarTop', start: [1, 0], end: [1, 0]},
          {name: 'hamburger', start: [0, 0], end: [0, 0]},
          {name: 'toolbarLeft', start: [0, 1], end: [0, 1]},
          {name: 'viewport', start: [1, 1], end: [1, 1]}
        ]}
      >
        <Box background='brand' gridArea='toolbarTop' align='center' justify='center'>
          Top toolbar
        </Box>
        <Box style={{height: `calc(100vh - ${TOOLBAR_SIZE})`}} gridArea='viewport'>
          <Switch>
            <Route path='/' component={Publishers} />
          </Switch>
        </Box>
        <Box background='brand' gridArea='hamburger' align='center' justify='center'>

        </Box>
        <Box background='brand' gridArea='toolbarLeft' align='center' justify='center'>
          Left toolbar
        </Box>
      </Grid>
    )}
    </CurrentUser>
  )
}

export default Chartmart