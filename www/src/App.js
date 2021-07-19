import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Grommet } from 'grommet'
import Plural from './components/Plural'
import { DEFAULT_THEME } from './theme'
import hljs from 'highlight.js'
import hljsDefineTerraform from './highlight/terraform'
import Invite from './components/Invite'
import { PasswordReset, ResetPassword } from './components/users/PasswordReset'
import { Login, PasswordlessLogin, Signup } from './components/users/MagicLogin'
import { OAuthConsent } from './components/oidc/OAuthConsent'
import { EmailConfirmed } from './components/users/EmailConfirmation'

hljs.registerLanguage('terraform', hljsDefineTerraform)

export default function App() {
  return (
    <Grommet theme={DEFAULT_THEME}>
      <Switch>
        <Route path='/reset-password/:id' component={ResetPassword} />
        <Route exact path='/password-reset' component={PasswordReset} />
        <Route path='/confirm-email/:id' component={EmailConfirmed} />
        <Route path='/invite/:inviteId' component={Invite} />
        <Route path='/passwordless-login/:token' component={PasswordlessLogin} />
        <Route exact path="/login" component={Login} />
        <Route exact path='/signup' component={Signup} />
        <Route exact path='/oauth/consent' component={OAuthConsent} />
        <Route path="/" component={Plural} />
      </Switch>
    </Grommet>
  )
}