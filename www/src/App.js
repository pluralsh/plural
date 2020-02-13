import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Grommet } from 'grommet'
import Login from './components/Login'
import Chartmart from './components/Chartmart'
import {DEFAULT_THEME} from './theme'
import hljs from 'highlight.js'
import hljsDefineTerraform from './highlight/terraform'

hljs.registerLanguage('terraform', hljsDefineTerraform)

export default function App() {
  return (
    <Grommet theme={DEFAULT_THEME}>
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route path="/" component={Chartmart} />
      </Switch>
    </Grommet>
  )
}