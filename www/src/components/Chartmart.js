import React from 'react'
import {Box, Grid} from 'grommet'
import { Switch, Route } from 'react-router-dom'
import CurrentUser from './login/CurrentUser'
import Publishers from './publisher/Publishers'
import MyPublisher from './publisher/MyPublisher'
import Publisher from './publisher/Publisher'
import Toolbar from './Toolbar'
import Repository from './repos/Repository'
import Chart from './repos/Chart'

const TOOLBAR_SIZE = '50px'

function Chartmart(props) {
  return (
    <CurrentUser>
    {me => (
      <Grid
        fill
        rows={[TOOLBAR_SIZE, 'flex']}
        columns={['100vw']}
        areas={[
          {name: 'toolbarTop', start: [0, 0], end: [0, 0]},
          {name: 'viewport', start: [0, 1], end: [0, 1]}
        ]}
      >
        <Box background='brand' gridArea='toolbarTop' align='center' justify='center'>
          <Toolbar me={me} />
        </Box>
        <Box style={{height: `calc(100vh - ${TOOLBAR_SIZE})`}} gridArea='viewport'>
          <Switch>
            <Route path='/publishers/mine' component={MyPublisher} />
            <Route path='/publishers/:publisherId' component={Publisher} />
            <Route path='/repositories/:repositoryId' component={Repository} />
            <Route path='/charts/:chartId' component={Chart} />
            <Route path='/' component={Publishers} />
          </Switch>
        </Box>
      </Grid>
    )}
    </CurrentUser>
  )
}

export default Chartmart