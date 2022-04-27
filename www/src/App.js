import 'react-toggle/style.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { IntercomProvider } from 'react-use-intercom'
import { Grommet } from 'grommet'
import { theme } from 'pluralsh-design-system'
import merge from 'lodash.merge'
import { CssBaseline, ThemeProvider } from 'honorable'

import { client } from './helpers/client'
import { INTERCOM_APP_ID } from './constants'
import { DEFAULT_THEME } from './theme'

import Plural from './components/Plural'
import Invite from './components/Invite'
import { Login, PasswordlessLogin, Signup } from './components/users/MagicLogin'
import { PasswordReset, ResetPassword } from './components/users/PasswordReset'
import { OAuthConsent } from './components/oidc/OAuthConsent'
import { EmailConfirmed } from './components/users/EmailConfirmation'
import { OAuthCallback } from './components/users/OAuthCallback'
import { SSOCallback } from './components/users/SSOCallback'

const grommetTheme = merge({}, DEFAULT_THEME, {
  mode: 'dark',
  defaultMode: 'dark',
  // HACK
  // To remove once the following bug is fixed
  // Grommet behaves as if it had the light theme mode on even if dark mode is on
  global: {
    colors: {
      background: {
        light: '#111525',
        dark: '#111525',
      },
      'background-back': {
        dark: '#111525',
        light: '#111525',
      },
      'background-front': {
        dark: '#181B29',
        light: '#181B29',
      },
      'background-contrast': {
        dark: '#222534',
        light: '#222534',
      },
    },
  },
})

function App() {
  return (
    <ApolloProvider client={client}>
      <IntercomProvider appId={INTERCOM_APP_ID}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Grommet
            full
            theme={grommetTheme}
            themeMode="dark"
          >
            <BrowserRouter>
              <Routes>
                <Route
                  path="/reset-password/:id"
                  element={<ResetPassword />}
                />
                <Route
                  exact
                  path="/password-reset"
                  element={<PasswordReset />}
                />
                <Route
                  path="/confirm-email/:id"
                  element={<EmailConfirmed />}
                />
                <Route
                  path="/invite/:inviteId"
                  element={<Invite />}
                />
                <Route
                  path="/passwordless-login/:token"
                  element={<PasswordlessLogin />}
                />
                <Route
                  exact
                  path="/oauth/callback/github/shell"
                  element={<Plural />}
                />
                <Route
                  path="/oauth/callback/:service"
                  element={<OAuthCallback />}
                />
                <Route
                  path="/sso/callback"
                  element={<SSOCallback />}
                />
                <Route
                  exact
                  path="/login"
                  element={<Login />}
                />
                <Route
                  exact
                  path="/signup"
                  element={<Signup />}
                />
                <Route
                  exact
                  path="/oauth/consent"
                  element={<OAuthConsent />}
                />
                <Route
                  path="*"
                  element={<Plural />}
                />
              </Routes>
            </BrowserRouter>
          </Grommet>
        </ThemeProvider>
      </IntercomProvider>
    </ApolloProvider>
  )
}

export default App
