import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Grommet } from 'grommet'
import { DEFAULT_THEME } from './theme';
import Watchman from './components/Watchman';
import Login, { EnsureLogin } from './components/Login'

export default function App() {
  return (
    <Grommet theme={DEFAULT_THEME}>
      <Switch>
        <Route path='/login' component={Login} />
        <Route path='/' component={Watchman} />
      </Switch>
    </Grommet>
  );
}