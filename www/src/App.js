import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { Grommet } from 'grommet'

import hljs from 'highlight.js'

import { IntercomProvider } from 'react-use-intercom'

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
import { SSOCallback } from './components/users/SSOCallback'

const INTERCOM_APP_ID = 'p127zb9y'
hljs.registerLanguage('terraform', hljsDefineTerraform)

export default function App() {
  return (
    <IntercomProvider appId={INTERCOM_APP_ID}>
      <Grommet theme={DEFAULT_THEME}>
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
            exact
            path="/oauth/callback/gitlab/shell"
            component={Plural}
          />
          <Route
            path="/oauth/callback/:service"
            component={OAuthCallback}
          />
          <Route
            path='/sso/callback'
            component={SSOCallback}
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
      </Grommet>
    </IntercomProvider>
  )
}
