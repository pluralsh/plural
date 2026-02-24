import { ApolloProvider } from '@apollo/client'
import { mergeDeep } from '@apollo/client/utilities'
import {
  BreadcrumbsProvider,
  GlobalStyle,
  useThemeColorMode,
} from '@pluralsh/design-system'
import { MarkdocContextProvider } from '@pluralsh/design-system/dist/markdoc'
import { Grommet, ThemeType } from 'grommet'
import {
  CssBaseline,
  ThemeProvider as HonorableThemeProvider,
  mergeTheme,
} from 'honorable'
import mpRecipe from 'honorable-recipe-mp'
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
import { client } from './helpers/client'
import { HistoryRouter, browserHistory } from './router'
import {
  polyfilledHonorableThemeDark,
  polyfilledHonorableThemeLight,
  polyfilledStyledThemeDark,
  polyfilledStyledThemeLight,
} from './styles'
import { DEFAULT_THEME } from './theme'

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
    colorMode === 'light'
      ? polyfilledHonorableThemeLight
      : polyfilledHonorableThemeDark,
    {
      global: [
        // This provides the mp spacing props to honorable
        // DEPRECATED in favor of the semantic spacing system
        mpRecipe(),
      ],
    }
  )
  const styledTheme =
    colorMode === 'light'
      ? polyfilledStyledThemeLight
      : polyfilledStyledThemeDark
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
      <ApolloProvider client={client}>
        <StyleSheetManager shouldForwardProp={shouldForwardProp}>
          <HonorableThemeProvider theme={honorableTheme}>
            {/* @ts-ignore - this will be fixed when we bump DS */}
            <StyledThemeProvider theme={mergedStyledTheme}>
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
            </StyledThemeProvider>
          </HonorableThemeProvider>
        </StyleSheetManager>
      </ApolloProvider>
    </Suspense>
  )
}

export default App
