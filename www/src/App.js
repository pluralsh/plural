import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Grommet } from 'grommet'
import { ApolloProvider } from 'react-apollo'
import hljs from 'highlight.js'
import merge from 'lodash.merge'
import { theme as pluralTheme } from 'pluralsh-design-system'

import { IntercomProvider } from 'react-use-intercom'

import { client } from './helpers/client'
import Plural from './components/Plural'
import { DEFAULT_THEME } from './theme'
import hljsDefineTerraform from './highlight/terraform'
import Invite from './components/Invite'
import { PasswordReset, ResetPassword } from './components/users/PasswordReset'
import { Login, PasswordlessLogin, Signup } from './components/users/MagicLogin'
import { OAuthConsent } from './components/oidc/OAuthConsent'
import { EmailConfirmed } from './components/users/EmailConfirmation'
import 'react-toggle/style.css'
import { OAuthCallback } from './components/users/OAuthCallback'

const INTERCOM_APP_ID = 'p127zb9y'
hljs.registerLanguage('terraform', hljsDefineTerraform)

export default function App() {
  return (
    <ApolloProvider client={client}>
      <IntercomProvider appId={INTERCOM_APP_ID}>
        <Grommet theme={merge({}, pluralTheme, DEFAULT_THEME)}> {/* TODO: DELETE DEFAULT_THEME */}
          <BrowserRouter>
            <Switch>
              <Route
                path="/reset-password/:id"
                component={ResetPassword}
              />
              <Route
                exact
                path="/password-reset"
                component={PasswordReset}
              />
              <Route
                path="/confirm-email/:id"
                component={EmailConfirmed}
              />
              <Route
                path="/invite/:inviteId"
                component={Invite}
              />
              <Route
                path="/passwordless-login/:token"
                component={PasswordlessLogin}
              />
              <Route
                exact
                path="/oauth/callback/github/shell"
                component={Plural}
              />
              <Route
                path="/oauth/callback/:service"
                component={OAuthCallback}
              />
              <Route
                exact
                path="/login"
                component={Login}
              />
              <Route
                exact
                path="/signup"
                component={Signup}
              />
              <Route
                exact
                path="/oauth/consent"
                component={OAuthConsent}
              />
              <Route
                path="/"
                component={Plural}
              />
            </Switch>
          </BrowserRouter>
        </Grommet>
      </IntercomProvider>
    </ApolloProvider>
  )
}
