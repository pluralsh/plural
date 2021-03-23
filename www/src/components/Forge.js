import React from 'react'
import { Box, Grid } from 'grommet'
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
import BreadcrumbProvider from './Breadcrumbs'
import { EditAccount } from './accounts/EditAccount'
import { Incidents } from './incidents/Incidents'
import { Incident } from './incidents/Incident'
import { Responses } from './incidents/Responses'
import { IncidentContext } from './incidents/context'
import { Integrations } from './integrations/Webhooks'
import { Webhook } from './integrations/Webhook'
import { OauthCreator } from './integrations/OauthCreator'
import { FlyoutContainer } from './utils/Flyout'
import { Docker, DockerRepository } from './repos/Docker'
import { Audits } from './accounts/Audits'

export const TOOLBAR_SIZE = '50px'

const EditBilling = (props) => <EditAccount {...props} billing />

export default function Forge() {
  return (
    <IncidentContext.Provider value={{}}>
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
              <Box fill pad='small' background='backgroundColor'>
                <Box background='white' fill>
                  <Switch>
                    <Route path='/accounts/edit/:section' component={EditAccount} />
                    <Route path='/accounts/billing/:section' component={EditBilling} />
                    <Route path='/publishers/mine' component={MyPublisher} />
                    <Route path='/publishers/:publisherId' component={Publisher} />
                    <Route path='/publishers' component={Publishers} />
                    <Route path='/dkr/repo/:id' component={DockerRepository} />
                    <Route path='/dkr/img/:id' component={Docker} />
                    <Route path='/repositories/:repositoryId/integrations' component={IntegrationPage} />
                    <Route path='/repositories/:repositoryId' component={Repository} />
                    <Route path='/charts/:chartId' component={Chart} />
                    <Route path='/terraform/:tfId' component={Terraform} />
                    <Route path='/me/edit' component={EditUser} />
                    <Route path='/billing/:section' component={Billing} />
                    <Route path='/me/invoices/:subscriptionId' component={Invoices} />
                    <Route path='/incidents/responses' component={Responses} />
                    <Route path='/incidents/:incidentId/edit' component={(props) => <Incident {...props} editing />} />
                    <Route path='/incidents/:incidentId' component={Incident} />
                    <Route path='/incidents' component={Incidents} />
                    <Route path='/webhooks/:id' component={Webhook} />
                    <Route path='/webhooks' component={Integrations} />
                    <Route path='/oauth/accept/:service' component={OauthCreator} />
                    <Route path='/audits' component={Audits} />
                    <Route path='/' component={Explore} />
                  </Switch>
                </Box>
              </Box>
              <FlyoutContainer />
            </Box>
          </Grid>
        </CurrentUser>
      </BreadcrumbProvider>
    </StripeProvider>
    </IncidentContext.Provider>
  )
}