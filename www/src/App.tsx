import { ApolloProvider } from '@apollo/client'
import {
  BreadcrumbsProvider,
  GlobalStyle,
  MarkdocContextProvider,
  styledThemeDark,
  styledThemeLight,
  useThemeColorMode,
} from '@pluralsh/design-system'
import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import styled, {
  StyleSheetManager,
  ThemeProvider as StyledThemeProvider,
} from 'styled-components'

import { shouldForwardProp } from './utils/shouldForwardProp'

import { PluralErrorBoundary } from './components/utils/PluralErrorBoundary'

import { OverlayContextProvider } from './components/layout/Overlay'
import { CursorPositionProvider } from './components/utils/CursorPosition'
import NavContextProvider from './contexts/NavigationContext'
import { useThemePreferenceSync } from './components/profile/themePreference'
import { client } from './helpers/client'
import { HistoryRouter, browserHistory } from './router'

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

  useThemePreferenceSync()
  const styledTheme = colorMode === 'light' ? styledThemeLight : styledThemeDark

  const routes = (
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
  )

  return (
    <Suspense>
      <ApolloProvider client={client}>
        <HistoryRouter history={browserHistory}>
          <StyleSheetManager shouldForwardProp={shouldForwardProp}>
            <StyledThemeProvider theme={styledTheme}>
              <CursorPositionProvider>
                <MarkdocContextProvider value={{ variant: 'console' }}>
                  <NavContextProvider>
                    <OverlayContextProvider>
                      <BreadcrumbsProvider>
                        <GlobalStyle />
                        <PluralErrorBoundary>
                          <RootBoxSC>{routes}</RootBoxSC>
                        </PluralErrorBoundary>
                      </BreadcrumbsProvider>
                    </OverlayContextProvider>
                  </NavContextProvider>
                </MarkdocContextProvider>
              </CursorPositionProvider>
            </StyledThemeProvider>
          </StyleSheetManager>
        </HistoryRouter>
      </ApolloProvider>
    </Suspense>
  )
}

export default App
