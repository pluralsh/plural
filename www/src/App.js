import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Grommet } from 'grommet'
import Login from './components/Login'
import Forge from './components/Forge'
import {DEFAULT_THEME} from './theme'
import hljs from 'highlight.js'
import hljsDefineTerraform from './highlight/terraform'
import Invite from './components/Invite'
import { PasswordReset } from './components/users/PasswordReset'

import '@brainhubeu/react-carousel/lib/style.css'

hljs.registerLanguage('terraform', hljsDefineTerraform)

export default function App() {
  return (
    <Grommet theme={DEFAULT_THEME}>
      <Switch>
        <Route exact path='/password-reset' component={PasswordReset} />
        <Route path='/invite/:inviteId' component={Invite} />
        <Route exact path="/login" component={Login} />
        <Route path="/" component={Forge} />
      </Switch>
    </Grommet>
  )
}