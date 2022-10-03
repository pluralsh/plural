import 'react-toggle/style.css'
import { Route, Routes } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { IntercomProvider } from 'react-use-intercom'
import { Box, Grommet } from 'grommet'
import { GlobalStyle, styledTheme, theme } from 'pluralsh-design-system'
import { CssBaseline, ThemeProvider, mergeTheme } from 'honorable'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import { mergeDeep } from '@apollo/client/utilities'

import mpRecipe from 'honorable-recipe-mp'

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
import HistoryRouter from './history/router'
import browserHistory from './history/browser'

const honorableTheme = mergeTheme(theme, {
  global: [
    // This provides the mp spacing props to honorable
    // DEPRECATED in favor of the semantic spacing system
    mpRecipe(),
  ],
})

function App() {
  const mergedStyledTheme = mergeDeep(DEFAULT_THEME, styledTheme)

  return (
    <ApolloProvider client={client}>
      <IntercomProvider appId={INTERCOM_APP_ID}>
        <ThemeProvider theme={honorableTheme}>
          <StyledThemeProvider theme={mergedStyledTheme}>
            <CssBaseline />
            <GlobalStyle />
            <Grommet
              full
              theme={mergedStyledTheme}
              themeMode="dark"
            >
              <Box
                width="100vw"
                height="100vh"
                background="#171A21"
              >
                <HistoryRouter history={browserHistory}>
                  <Routes>
                    <Route
                      path="/reset-password/:id"
                      element={<ResetPassword />}
                    />
                    <Route
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
                      path="/oauth/callback/github/shell"
                      element={<Plural />}
                    />
                    <Route
                      path="/oauth/callback/gitlab/shell"
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
                      path="/login"
                      element={<Login />}
                    />
                    <Route
                      path="/signup"
                      element={<Signup />}
                    />
                    <Route
                      path="/oauth/consent"
                      element={<OAuthConsent />}
                    />
                    <Route
                      path="*"
                      element={<Plural />}
                    />
                  </Routes>
                </HistoryRouter>
              </Box>
            </Grommet>
          </StyledThemeProvider>
        </ThemeProvider>
      </IntercomProvider>
    </ApolloProvider>
  )
}

export default App
