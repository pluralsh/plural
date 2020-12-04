import React from 'react'
import {Box, Grid} from 'grommet'
import { Switch, Route } from 'react-router-dom'
import CurrentUser from './login/CurrentUser'
import MyPublisher from './publisher/MyPublisher'
import Publisher from './publisher/Publisher'
import Toolbar from './Toolbar'
import Repository from './repos/Repository'
import Chart from './repos/Chart'
import Terraform from './repos/Terraform'
import EditUser from './users/EditUser'
import { IntegrationPage } from './repos/Integrations'
import { StripeProvider } from 'react-stripe-elements'
import Invoices from './payments/Invoices'
import Sidebar from './Sidebar'
import Publishers from './publisher/Publishers'
import Explore from './Explore'
import { Billing } from './users/Billing'
import BreadcrumbProvider, { Breadcrumbs } from './Breadcrumbs'

export const TOOLBAR_SIZE = '60px'

export default function Forge() {
  return (
    <StripeProvider apiKey="pk_test_ZVj7wQQqsBDrud0mttnnY6uy00QM8CndBt">
      <BreadcrumbProvider>
        <CurrentUser>
          <Grid fill rows={[TOOLBAR_SIZE, 'flex']} columns={['100vw']} areas={[
              {name: 'toolbarTop', start: [0, 0], end: [0, 0]},
              {name: 'viewport', start: [0, 1], end: [0, 1]}
            ]}>
            <Box background='sidebar' gridArea='toolbarTop' align='center' justify='center'>
              <Toolbar />
            </Box>
            <Box style={{height: `calc(100vh - ${TOOLBAR_SIZE})`}} direction='row' gridArea='viewport'>
              <Sidebar />
              <Box fill>
                <Breadcrumbs />
                <Switch>
                  <Route path='/publishers/mine' component={MyPublisher} />
                  <Route path='/publishers/:publisherId' component={Publisher} />
                  <Route path='/publishers' component={Publishers} />
                  <Route path='/repositories/:repositoryId/integrations' component={IntegrationPage} />
                  <Route path='/repositories/:repositoryId' component={Repository} />
                  <Route path='/charts/:chartId' component={Chart} />
                  <Route path='/terraform/:tfId' component={Terraform} />
                  <Route path='/me/edit' component={EditUser} />
                  <Route path='/billing/:section' component={Billing} />
                  <Route path='/me/invoices/:subscriptionId' component={Invoices} />
                  <Route path='/' component={Explore} />
                </Switch>
              </Box>
            </Box>
          </Grid>
        </CurrentUser>
      </BreadcrumbProvider>
    </StripeProvider>
  )
}