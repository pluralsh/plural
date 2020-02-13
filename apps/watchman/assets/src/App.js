import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Grommet } from 'grommet'
import { DEFAULT_THEME } from './theme';
import Watchman from './components/Watchman';

export default function App() {
  return (
    <Grommet theme={DEFAULT_THEME}>
      <Switch>
        <Route path='/' component={Watchman} />
      </Switch>
    </Grommet>
  );
}