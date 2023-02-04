import 'react-toggle/style.css'
import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { IntercomProvider } from 'react-use-intercom'
import { Box, Grommet, ThemeType } from 'grommet'
import { GlobalStyle, styledTheme, theme } from '@pluralsh/design-system'
import { CssBaseline, ThemeProvider, mergeTheme } from 'honorable'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import { mergeDeep } from '@apollo/client/utilities'
import mpRecipe from 'honorable-recipe-mp'
import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react'

import { client } from './helpers/client'
import { INTERCOM_APP_ID } from './constants'
import { DEFAULT_THEME } from './theme'
import { HistoryRouter, browserHistory } from './router'
import { growthbook } from './helpers/growthbook'

const Plural = lazy(() => import('./components/Plural'))
const Invite = lazy(() => import('./components/Invite'))
const Login = lazy(() => import('./components/users/MagicLogin').then(module => ({ default: module.Login })))
const PasswordlessLogin = lazy(() => import('./components/users/MagicLogin').then(module => ({ default: module.PasswordlessLogin })))
const Signup = lazy(() => import('./components/users/Signup').then(module => ({ default: module.Signup })))
const PasswordReset = lazy(() => import('./components/users/PasswordReset').then(module => ({ default: module.PasswordReset })))
const ResetPassword = lazy(() => import('./components/users/PasswordReset').then(module => ({ default: module.ResetPassword })))
const OAuthConsent = lazy(() => import('./components/oidc/OAuthConsent').then(module => ({ default: module.OAuthConsent })))
const EmailConfirmed = lazy(() => import('./components/users/EmailConfirmation').then(module => ({ default: module.EmailConfirmed })))
const OAuthCallback = lazy(() => import('./components/users/OAuthCallback').then(module => ({ default: module.OAuthCallback })))
const SSOCallback = lazy(() => import('./components/users/SSOCallback').then(module => ({ default: module.SSOCallback })))

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
    <Suspense>
      <ApolloProvider client={client}>
        <IntercomProvider appId={INTERCOM_APP_ID}>
          <ThemeProvider theme={honorableTheme}>
            <StyledThemeProvider theme={mergedStyledTheme}>
              <GrowthBookProvider growthbook={growthbook as any as GrowthBook}>
                <CssBaseline />
                <GlobalStyle />
                <Grommet
                  full
                  theme={mergedStyledTheme as any as ThemeType}
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
              </GrowthBookProvider>
            </StyledThemeProvider>
          </ThemeProvider>
        </IntercomProvider>
      </ApolloProvider>
    </Suspense>
  )
}

export default App
