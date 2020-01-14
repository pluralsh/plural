import React, {useState} from 'react'
import {Box, Grid} from 'grommet'
import { Switch, Route } from 'react-router-dom'
import Home from './Home'
import CurrentUser from './login/CurrentUser'
import MyPublisher from './publisher/MyPublisher'
import Publisher from './publisher/Publisher'
import Toolbar from './Toolbar'
import Repository from './repos/Repository'
import Chart from './repos/Chart'
import Terraform from './repos/Terraform'
import EditUser from './users/EditUser'
import Breadcrumbs from './utils/Breadcrumbs'
import {IntegrationPage} from './repos/Integrations'
import {StripeProvider} from 'react-stripe-elements'
import BillingDetails from './users/BillingDetails'

export const TOOLBAR_SIZE = '60px'
export const BreadcrumbContext = React.createContext({})

function Chartmart(props) {
  const [breadcrumbs, setBreadcrumbs] = useState([])
  return (
    <StripeProvider apiKey="pk_test_ZVj7wQQqsBDrud0mttnnY6uy00QM8CndBt">
      <BreadcrumbContext.Provider value={{breadcrumbs, setBreadcrumbs}}>
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
            <Box background='sidebar' gridArea='toolbarTop' align='center' justify='center'>
              <Toolbar me={me} />
            </Box>
            <Box style={{height: `calc(100vh - ${TOOLBAR_SIZE})`}} gridArea='viewport'>
              {breadcrumbs.length > 0 && (<Breadcrumbs crumbs={breadcrumbs} />)}
              <Switch>
                <Route path='/publishers/mine' component={MyPublisher} />
                <Route path='/publishers/:publisherId' component={Publisher} />
                <Route path='/repositories/:repositoryId/integrations' component={IntegrationPage} />
                <Route path='/repositories/:repositoryId' component={Repository} />
                <Route path='/charts/:chartId' component={Chart} />
                <Route path='/terraform/:tfId' component={Terraform} />
                <Route path='/me/edit' component={EditUser} />
                <Route path='/me/billing' component={BillingDetails} />
                <Route path='/' component={Home} />
              </Switch>
            </Box>
          </Grid>
        )}
        </CurrentUser>
      </BreadcrumbContext.Provider>
    </StripeProvider>
  )
}

export default Chartmart