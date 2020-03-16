import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Grommet } from 'grommet'
import { DEFAULT_THEME } from './theme';
import Watchman from './components/Watchman';
import Login from './components/Login'
import SignUp from './components/SignUp';

export default function App() {
  return (
    <Grommet theme={DEFAULT_THEME}>
      <Switch>
        <Route path='/login' component={Login} />
        <Route path='/invite/:inviteId' component={SignUp} />
        <Route path='/' component={Watchman} />
      </Switch>
    </Grommet>
  );
}