import 'react-toggle/style.css'
import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { IntercomProvider } from 'react-use-intercom'
import { Grommet, ThemeType } from 'grommet'
import {
  BreadcrumbsProvider,
  GlobalStyle,
  honorableThemeDark,
  honorableThemeLight,
  styledThemeDark,
  styledThemeLight,
  useThemeColorMode,
} from '@pluralsh/design-system'
import { MarkdocContextProvider } from '@pluralsh/design-system/dist/markdoc'
import { CssBaseline, ThemeProvider, mergeTheme } from 'honorable'
import styled, { ThemeProvider as StyledThemeProvider } from 'styled-components'
import { mergeDeep } from '@apollo/client/utilities'
import mpRecipe from 'honorable-recipe-mp'
import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react'

import { PluralErrorBoundary } from './components/utils/PluralErrorBoundary'

import { client } from './helpers/client'
import { INTERCOM_APP_ID } from './constants'
import { DEFAULT_THEME } from './theme'
import { HistoryRouter, browserHistory } from './router'
import { growthbook } from './helpers/growthbook'
import { OverlayContextProvider } from './components/layout/Overlay'
import NavContextProvider from './contexts/NavigationContext'
import { CursorPositionProvider } from './components/utils/CursorPosition'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

const Plural = lazy(() => import('./components/Plural'))
const Invite = lazy(() => import('./components/Invite'))
const Login = lazy(() =>
  import('./components/users/MagicLogin').then((module) => ({
    default: module.Login,
  }))
)
const PasswordlessLogin = lazy(() =>
  import('./components/users/MagicLogin').then((module) => ({
    default: module.PasswordlessLogin,
  }))
)
const Signup = lazy(() =>
  import('./components/users/Signup').then((module) => ({
    default: module.Signup,
  }))
)
const RequestPasswordReset = lazy(() =>
  import('./components/users/RequestPasswordReset').then((module) => ({
    default: module.RequestPasswordReset,
  }))
)
const ResetPassword = lazy(() =>
  import('./components/users/ResetPassword').then((module) => ({
    default: module.ResetPassword,
  }))
)
const OAuthConsent = lazy(() =>
  import('./components/oidc/OAuthConsent').then((module) => ({
    default: module.OAuthConsent,
  }))
)
const EmailConfirmed = lazy(() =>
  import('./components/users/EmailConfirmation').then((module) => ({
    default: module.EmailConfirmed,
  }))
)
const OAuthCallback = lazy(() =>
  import('./components/users/OAuthCallback').then((module) => ({
    default: module.OAuthCallback,
  }))
)
const SSOCallback = lazy(() =>
  import('./components/users/SSOCallback').then((module) => ({
    default: module.SSOCallback,
  }))
)

const RootBoxSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  maxWidth: '100%',
  minWidth: 0,
  minHeight: 0,
  height: '100vh',
  width: '100vw',
  outline: 'none',
  backgroundColor: theme.colors['fill-zero'],
}))

function App() {
  const colorMode = useThemeColorMode()

  const honorableTheme = mergeTheme(
    colorMode === 'light' ? honorableThemeLight : honorableThemeDark,
    {
      global: [
        // This provides the mp spacing props to honorable
        // DEPRECATED in favor of the semantic spacing system
        mpRecipe(),
      ],
    }
  )
  const styledTheme = colorMode === 'light' ? styledThemeLight : styledThemeDark
  const mergedStyledTheme = mergeDeep(DEFAULT_THEME, styledTheme)

  const routes = (
    <HistoryRouter history={browserHistory}>
      <Routes>
        <Route
          path="/reset-password/:id"
          element={<ResetPassword />}
        />
        <Route
          path="/password-reset"
          element={<RequestPasswordReset />}
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
  )

  return (
    <Suspense>
      <GoogleReCaptchaProvider reCaptchaKey="">
        <ApolloProvider client={client}>
          <IntercomProvider appId={INTERCOM_APP_ID}>
            <ThemeProvider theme={honorableTheme}>
              <StyledThemeProvider theme={mergedStyledTheme}>
                <GrowthBookProvider
                  growthbook={growthbook as any as GrowthBook}
                >
                  <CursorPositionProvider>
                    <MarkdocContextProvider value={{ variant: 'console' }}>
                      <NavContextProvider>
                        <OverlayContextProvider>
                          <BreadcrumbsProvider>
                            <CssBaseline />
                            <GlobalStyle />
                            <Grommet
                              full
                              theme={mergedStyledTheme as any as ThemeType}
                              themeMode="dark"
                            >
                              <PluralErrorBoundary>
                                <RootBoxSC>{routes}</RootBoxSC>
                              </PluralErrorBoundary>
                            </Grommet>
                          </BreadcrumbsProvider>
                        </OverlayContextProvider>
                      </NavContextProvider>
                    </MarkdocContextProvider>
                  </CursorPositionProvider>
                </GrowthBookProvider>
              </StyledThemeProvider>
            </ThemeProvider>
          </IntercomProvider>
        </ApolloProvider>
      </GoogleReCaptchaProvider>
    </Suspense>
  )
}

export default App
