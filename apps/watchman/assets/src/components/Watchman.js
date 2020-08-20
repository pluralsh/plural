import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Box } from 'grommet'
import Sidebar from './Sidebar'
import Builds from './Builds'
import Build from './Build'
import BreadcrumbProvider, { Breadcrumbs } from './Breadcrumbs'
import Webhooks from './Webhooks'
import Configuration from './Configuration'
import Dashboards from './Dashboards'
import { EnsureLogin } from './Login'
import EditUser from './EditUser'
import Users from './Users'

const SIDEBAR_WIDTH = '70px'

export default function Watchman() {
  return (
    <EnsureLogin>
      <BreadcrumbProvider>
        <Box direction='row' width='100vw' height='100vh'>
          <Box width={SIDEBAR_WIDTH}>
            <Sidebar />
          </Box>
          <Box height='100vh' width='100%'>
            <Breadcrumbs />
            <Switch>
              <Route path='/config/:repo' component={Configuration} />
              <Route path='/config' component={Configuration} />
              <Route path='/build/:buildId' component={Build} />
              <Route path='/webhooks' component={Webhooks} />
              <Route path='/dashboards/:repo' component={Dashboards} />
              <Route path='/dashboards' component={Dashboards} />
              <Route path='/me/edit' component={EditUser} />
              <Route path='/users' component={Users} />
              <Route path='/' component={Builds} />
            </Switch>
          </Box>
        </Box>
      </BreadcrumbProvider>
    </EnsureLogin>
  )
}