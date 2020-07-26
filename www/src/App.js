import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Grommet } from 'grommet'
import Login from './components/Login'
import Forge from './components/Forge'
import {DEFAULT_THEME} from './theme'
import hljs from 'highlight.js'
import hljsDefineTerraform from './highlight/terraform'
import '@brainhubeu/react-carousel/lib/style.css'
hljs.registerLanguage('terraform', hljsDefineTerraform)

export default function App() {
  return (
    <Grommet theme={DEFAULT_THEME}>
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route path="/" component={Forge} />
      </Switch>
    </Grommet>
  )
}