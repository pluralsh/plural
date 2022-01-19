import ClientOAuth2 from 'client-oauth2'

export const githubAuth = new ClientOAuth2({
  clientId: '06d6a9dd27bd2eaac3e8', // prod
  // clientId: '51e5cc5e8fcd70a92df9', // dev
  accessTokenUri: 'https://github.com/login/oauth/access_token',
  authorizationUri: 'https://github.com/login/oauth/authorize',
  redirectUri: 'https://app.plural.sh/oauth/callback/github/shell',
  scopes: ['repo', 'read:org']
})